import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  type Listing = {
    id : Text;
    title : Text;
    description : Text;
    price : Float;
    category : Category;
    imageId : ?Text;
    seller : Principal;
    sellerDisplayName : Text;
    timestamp : Int;
  };

  type Category = {
    #textbooks;
    #electronics;
    #clothing;
    #furniture;
    #stationery;
    #other;
  };

  type UserProfile = {
    name : Text;
    displayName : Text;
  };

  let listings = Map.empty<Text, Listing>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── User Profile Functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Listing Functions ───────────────────────────────────────────────────────

  public shared ({ caller }) func createListing(
    title : Text,
    description : Text,
    price : Float,
    category : Category,
    imageId : ?Text,
    sellerDisplayName : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can post listings");
    };
    let timestamp = Time.now();
    let id = title # (debug_show timestamp);
    let listing : Listing = {
      id;
      title;
      description;
      price;
      category;
      imageId;
      seller = caller;
      sellerDisplayName;
      timestamp;
    };
    listings.add(id, listing);
    id;
  };

  public query func getAllListings() : async [Listing] {
    listings.values().toArray();
  };

  public query func getListingsByCategory(category : Category) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.category == category;
      }
    );
  };

  public query func getListingsBySeller(seller : Principal) : async [Listing] {
    listings.values().toArray().filter(
      func(listing) {
        listing.seller == seller;
      }
    );
  };

  public query ({ caller }) func getMyListings() : async [Listing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their listings");
    };
    listings.values().toArray().filter(
      func(listing) {
        listing.seller == caller;
      }
    );
  };

  public shared ({ caller }) func deleteListing(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete listings");
    };
    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };
    if (listing.seller != caller) {
      Runtime.trap("Unauthorized: Cannot delete others' listings");
    };
    listings.remove(listingId);
  };
};
