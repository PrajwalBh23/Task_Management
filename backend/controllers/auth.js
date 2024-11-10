const https = require('https');
const User = require('../model/Users.js');  // Use `const` to declare User
const bcrypt = require('bcrypt');           // Use `const` to declare bcrypt
const jwt = require('jsonwebtoken');        // Use `const` to declare jwt
const dotenv = require('dotenv');           // Use `const` to declare dotenv
const passport = require('./passport.js');

dotenv.config();

const register = async (req, res, next) => {
    try {
        const { name, email, phone, password  } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password || !phone) {
            return res.status(422).json({ error: "Please fill in all the fields properly" });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(409).json({ error: "Email already exists" });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        let newUser = new User({
            name,
            email,
            phone,
            password: hash,
        });
        // Save the user and generate a token
        await newUser.save();

        // Include the isCounsellor field in the token payload
        const token = jwt.sign({ _id: newUser._id }, process.env.SECRET_KEY);

        // Return the token and isCounsellor status in the response
        res.status(200).json({
            message: "User has been created",
            token,
        });

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate the request body
        if (!email || !password) {
            return res.status(400).json({ error: 'Please fill in the data' });
        }

        // Find the user in either User or Professional collections
        const user = await User.findOne({ email });

        // If user not found, return an error
        if (!user) {
            return res.status(401).json({ error: "User Not found" });
        }

        // Compare the password with the stored hashed password
        const isPasswordCorrect = bcrypt.compare(password, user.password);

        // If password doesn't match, return an error
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        // Generate JWT token with isCounsellor flag if the user is a counsellor
        const tokenPayload = { _id: user._id };

        const token = jwt.sign(tokenPayload, process.env.SECRET_KEY);

        // Send the token in the response with a cookie
        res.cookie("JwtToken", token, {
            expires: new Date(Date.now() + 259200000),  // Cookie expiry set for 3 days
            httpOnly: true,  // Ensures the cookie can't be accessed via JavaScript
        });

        // Respond with token and isCounsellor flag (if applicable)
        return res.status(200).json({
            message: "User signed in successfully",
            token,
        });

    } catch (error) {
        next(error);
    }
};


const isLogin = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (user) {
            // console.log("getto user");
            return res.status(200).json({
                success: true,
                user
            })
        } else {
            // console.log("not getto user");
            return res.status(200).json({
                success: true,
                user
            })
        }

    } catch (err) {
        console.log("all error");
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}


const isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.log("No token provided.");
            return res.status(401).json({
                success: false,
                message: "Missing Token"
            });
        }

        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                console.log("Token verification failed:", err.message);
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            const userId = decoded._id; // Make sure to use decoded._id

            // Find the user by the ID from the decoded token
            const userfind = await User.findById(userId); // Use userId here
            if (!userfind) {
                console.log("User not found for ID:", userId);
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Attach the user to the request object
            req.user = userfind;
            next();
        });

    } catch (err) {
        console.error("Internal server error:", err.message);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}



const google_login = async (req, res) => {
    const { code } = req.body;

    try {
        const { token, user } = await handleGoogleAuth(code, 'login');
        res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error during Google login' });
    }
}

const google_signup = async (req, res) => {
    const { code } = req.body;

    try {
        const googleData = await exchangeCodeForGoogleData(code); // Fetch Google user data
        const existingUser = await User.findOne({ email: googleData.email });
        
        if (existingUser) {
            // Optionally, return existing user data or generate a new token
            const token = await existingUser.generateAuthToken(); // Generate token for existing user
            return res.status(200).json({ token });
        }

        let newUser = new User({
            name: googleData.name,
            email: googleData.email,
        });

        // Save the new user and generate a token
        await newUser.save();
        const token = await newUser.generateAuthToken(); // Generate token for new user
        res.status(200).json({ token, newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error during Google signup' });
    }
}

async function handleGoogleAuth(code, action) {
    // Exchange the code for a Google access token
    const googleData = await exchangeCodeForGoogleData(code);

    // Use the email to find or create a user in the database
    const user = action === 'login'
        ? await findUserByEmail(googleData.email)
        : await findOrCreateUser(googleData);

    if (!user) throw new Error(`User ${action} failed`);

    // Generate a JWT for the user
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    return { token, user };
}

async function exchangeCodeForGoogleData(code) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        const options = {
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                const tokenResponse = JSON.parse(responseData);
                const accessToken = tokenResponse.access_token;

                // Fetch user info
                const userInfoOptions = {
                    hostname: 'www.googleapis.com',
                    path: '/oauth2/v1/userinfo',
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                };

                const userInfoReq = https.request(userInfoOptions, (userInfoRes) => {
                    let userInfoData = '';

                    userInfoRes.on('data', (chunk) => {
                        userInfoData += chunk;
                    });

                    userInfoRes.on('end', () => {
                        resolve(JSON.parse(userInfoData));
                    });
                });

                userInfoReq.on('error', (error) => {
                    console.error('Error fetching user info:', error);
                    reject(new Error('Failed to retrieve Google user data'));
                });

                userInfoReq.end();
            });
        });

        req.on('error', (error) => {
            console.error('Error exchanging code for Google data:', error);
            reject(new Error('Failed to retrieve Google user data'));
        });

        req.write(data);
        req.end();
    });
}

async function findUserByEmail(email) {
    // Implement user lookup in the database
    const user = await User.findOne({ email });
    return user;
}

async function findOrCreateUser(googleData) {
    let user = await User.findOne({ email: googleData.email });

    if (!user) {
        // Create a new user without the phone field
        user = new User({
            name: googleData.name,
            email: googleData.email,
        });
        await user.save(); // Save the new user to the database
    }

    return user; // Return the user object
}




module.exports = { register, login, isLogin, isAuthenticated, google_login, google_signup }; 