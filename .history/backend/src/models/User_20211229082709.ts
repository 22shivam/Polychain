import mongoose from 'mongoose';
// write a user model 

interface IUser extends mongoose.Document {
    username: {
        type: String,
        required: true,
    };
    ETHAddress: {
        type: String,
        required: false,
    };
    SOLAddress: {
        type: String,
        required: false,
    };
    DESOAddress: {
        type: String,
        required: false,
    };
    BTCAddress: {
        type: String,
        required: false,
    };
    bio: {
        type: String,
        required: false,
    };
    profilePic: {
        type: String,
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
