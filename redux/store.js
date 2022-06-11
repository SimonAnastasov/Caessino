import { configureStore } from "@reduxjs/toolkit";

import playerReducer from "./reducers/playerSlice";
import styleReducer from "./reducers/styleSlice";

export const store = configureStore({
    reducer: {
        player: playerReducer,
        style: styleReducer,
    },
})