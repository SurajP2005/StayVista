const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
require("dotenv").config({ path: "../.env" });
const dbUrl = process.env.ATLASDB_URL;


main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
};

const initDB=async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a739f3b8f779c3543b764ab",
}));
    await Listing.insertMany(initData.data);
    console.log("data was intialise");

}
initDB();