import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import config from "../config";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchActive, setSearchActive] = useState(false); // To track if user is efficiently searching

    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setSearchActive(false);
            return;
        }

        setIsSearching(true);
        setSearchActive(true);
        try {
            const res = await axios.get(`${config.API_URL}/api/file/search?q=${query}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error("Search failed:", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setSearchActive(false);
    };

    return (
        <SearchContext.Provider
            value={{
                searchQuery,
                setSearchQuery,
                searchResults,
                isSearching,
                searchActive,
                performSearch,
                clearSearch
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};
