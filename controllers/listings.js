const Listing=require("../models/listing");
const geocode = require("../utils/geocode");


// Index Page (Displays all listings)
module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    let filter = {};
    // Category Filter
    if (category) {
        filter.category = category;
    }
    // Search Filter
    if (search) {
        filter.$or = [
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }
    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", {
        allListings,
        category,
        search,
    });
};
//New Listing Page/Form
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

//Display/Show Specific Listing
module.exports.showListing=async (req,res)=>{
    let{id}=req.params;
    const listing=await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist!")
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

//Create New Listing Post route
module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);

    // Get coordinates from the location and country
    const geometry = await geocode(
        newListing.location,
        newListing.country
    );
    if (geometry) {
        newListing.geometry = geometry;
    }

    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

//Edit/Update Listing page/form
module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist")
        return res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

//Update listing Post route
module.exports.updateListing=async (req,res)=>{
    let{id}=req.params;
   let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

   if(typeof req.file !== "undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
   }
    req.flash("success","Listing Updated")
   res.redirect(`/listings/${id}`);
};

//Delete Listing
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success","Listing Deleted!")
    res.redirect("/listings");
};