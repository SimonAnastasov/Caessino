import { configureStore } from "@reduxjs/toolkit";

import playerReducer from "./reducers/playerSlice";
import styleReducer from "./reducers/styleSlice";
import adminReducer from "./reducers/adminSlice";
import adminInformationReducer from "./reducers/adminInformationSlice";

export const store = configureStore({
    reducer: {
        player: playerReducer,
        style: styleReducer,
        admin: adminReducer,
        adminInformation: adminInformationReducer,
    },
})