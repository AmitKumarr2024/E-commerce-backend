import mongoose from "mongoose";

const connected = async () => {
    try {
        mongoose.connect(process.env.MONGOURL)
    } catch (error) {
        console.log("mongoose",error);
        
    }
};

export default connected