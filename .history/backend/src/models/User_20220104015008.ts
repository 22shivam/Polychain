import mongoose from 'mongoose';
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

// interface that describes the properties a user model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: userAttr): UserDoc;
}

// interface that describes a property that a user document has
interface UserDoc extends mongoose.Document, userAttr {

}

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    ETHAddress: {
        type: String,
        required: false,
        default: ""
    },
    SOLAddress: {
        type: String,
        required: false,
        default: ""
    },
    DESOAddress: {
        type: String,
        required: false,
        default: ""
    },
    BTCAddress: {
        type: String,
        required: false,
        default: ""
    },
    bio: {
        type: String,
        required: false,
        default: ""
    },
    profilePic: {
        type: String,
        required: false,
        default: ""
    }
    // twitterLink: {
    //     type: String,
    //     required: false,
    // }

})

UserSchema.statics.build = (attr: userAttr) => {
    return new User(attr)

}

const User = mongoose.model<UserDoc, UserModel>('User', UserSchema);


export default User
