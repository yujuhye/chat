import axios from "axios";
import React, { useEffect, useState } from "react";

import {FaRegStar, FaStar} from "react-icons/fa";

function Favorite(props) {

    const [isFavorite, setIsFavorite] = useState(false);
    const { no, favorite } = props.friendDetails;

    useEffect(() => {

        if(favorite === 1) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }

    },[favorite]);

    const favoriteClickHandler = async () => {
        console.log('favoriteClickHandler()');

        setIsFavorite(!isFavorite);

        try {
            if(!isFavorite) {

                const response = await axios.put('http://localhost:3001/friend/addFavorite', {
                    no: no,
                });
                console.log('favorite success', response.data);

            } else {

                const response = await axios.put('http://localhost:3001/friend/deleteFavorite', {
                    no: no,
                });
                console.log('favorite delete success', response.data);

            }
            
        } catch (error) {
            console.log('favorite error');
            
        }
    }

    return(
        <>
         {isFavorite ? (
            <FaStar color="yellow" size="2em" onClick={favoriteClickHandler} />
        ) : (
            <FaRegStar color="gray" size="2em" onClick={favoriteClickHandler} />
        )}
        </>
    );
}

export default Favorite;