import mongoose from 'mongoose';
// write a PolychainDrop model 

// interface that describes properties needed to create a PolychainDrop
export interface polychainDropAttr {
    address?: string;
    promo?: string;
}

// interface that describes the properties a PolychainDrop model has
interface PolychainDropModel extends mongoose.Model<PolychainDropDoc> {
    build(attrs: polychainDropAttr): PolychainDropDoc;
}

// interface that describes a property that a PolychainDrop document has
interface PolychainDropDoc extends mongoose.Document, polychainDropAttr {

}

const PolychainDropSchema = new mongoose.Schema({
    address: {
        type: String,
        required: false,
        default: ""
    },
    promo: {
        type: String,
        required: false,
    }
})

PolychainDropSchema.statics.build = (attr: polychainDropAttr) => {
    return new PolychainDrop(attr)
}

const PolychainDrop = mongoose.model<PolychainDropDoc, PolychainDropModel>('PolychainDrop', PolychainDropSchema);


export default PolychainDrop
