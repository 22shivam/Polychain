import mongoose from 'mongoose';
// write a user model 

export interface IUser {
    // username: string;
    // ETHAddress: string;
    // BTCAddress: string;
    // SOLAddress: string;
    // DESOAddress: string;
    // bio: string;
    // profilePic: string;
    username: {
        type: string,
        required: true,
    },
    ETHAddress: {
        type: string,
        required: false,
    },
    SOLAddress: {
        type: string,
        required: false,
    },
    DESOAddress: {
        type: string,
        required: false,
    },
    BTCAddress: {
        type: string,
        required: false,
    },
    bio: {
        type: string,
        required: false,
    },
    profilePic: {
        type: string,
        required: false
    }
}

const UserSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
    },
    ETHAddress: {
        type: String,
        required: false,
    },
    SOLAddress: {
        type: String,
        required: false,
    },
    DESOAddress: {
        type: String,
        required: false,
    },
    BTCAddress: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
    },
    profilePic: {
        type: String,
        required: false
    }
    // twitterLink: {
    //     type: String,
    //     required: false,
    // }

})

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
