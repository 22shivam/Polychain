import mongoose from 'mongoose';
import User from '../../built/models/User';
// write a user model 

// interface that describes properties needed to create a user
export interface userAttr {
    username: string;
    ETHAddress?: string;
    BTCAddress?: string;
    SOLAddress?: string;
    DESOAddress?: string;
    bio?: string;
    profilePic?: string;
}

// interface that described the properties a user model has
interface UserModel extends mongoose.Model<any> {
    build(attrs: userAttr): any;
}

const UserSchema = new mongoose.Schema({
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

UserSchema.statics.build = (attr: userAttr) => {
    return new User(attr)

}

const User = mongoose.model<any, UserModel>('User', UserSchema);

User.build({})

export { User }
