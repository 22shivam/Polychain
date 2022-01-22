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
    },
    twitterUrl: {
        type: String,
        required: false,
    },
    facebookUrl: {
        type: String,
        required: false,
    },
    instagramUrl: {
        type: String,
        required: false,
    },
    linkedinUrl: {
        type: String,
        required: false,
    },
    youtubeUrl: {
        type: String,
        required: false,
    },
    githubUrl: {
        type: String,
        required: false,
    },
    redditUrl: {
        type: String,
        required: false,
    },
    tiktokUrl: {
        type: String,
        required: false,
    },
    snapchatUrl: {
        type: String,
        required: false,
    },
    pinterestUrl: {
        type: String,
        required: false,
    },


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