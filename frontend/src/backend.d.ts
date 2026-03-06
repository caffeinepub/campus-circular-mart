import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Listing {
    id: string;
    title: string;
    sellerDisplayName: string;
    description: string;
    seller: Principal;
    timestamp: bigint;
    category: Category;
    imageId?: string;
    price: number;
}
export interface UserProfile {
    displayName: string;
    name: string;
}
export enum Category {
    clothing = "clothing",
    other = "other",
    furniture = "furniture",
    stationery = "stationery",
    textbooks = "textbooks",
    electronics = "electronics"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: number, category: Category, imageId: string | null, sellerDisplayName: string): Promise<string>;
    deleteListing(listingId: string): Promise<void>;
    getAllListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingsByCategory(category: Category): Promise<Array<Listing>>;
    getListingsBySeller(seller: Principal): Promise<Array<Listing>>;
    getMyListings(): Promise<Array<Listing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
