import mongoose from 'mongoose';
// write a user model 

interface IUser {
    username: string;
    ETHAddress: string;
    BTCAddress: string;
    SOLAddress: string;
    DESOAddress: string;
    bio: string;
    profilePic: string;
}

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    ETHaddress: {
        type: String,
        required: false,
    },
    SOLaddress: {
        type: String,
        required: false,
    },
    DESOaddress: {
        type: String,
        required: false,
    },
    BTCaddress: {
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
