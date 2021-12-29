import mongoose from 'mongoose';
// write a user model 
const UserModelInterface = {
    username: string,
    ETHaddress: string,
    SOLaddress: string,
    DESOaddress: string,
    BITCOINaddress: string,
    bio: string
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
    BITCOINaddress: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
    },
    // twitterLink: {
    //     type: String,
    //     required: false,
    // }

})

const UserModel = mongoose.model < UserModelInterface > ('User', UserSchema);

export default UserModel;
