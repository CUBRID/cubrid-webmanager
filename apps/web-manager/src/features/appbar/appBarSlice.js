import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hostConnection: { open: false },
  aboutCubrid: false,
  profile: false,
  updatePassword: false,
  exportHost: false,
  importHost: false,
  brokerLogParser: false,
  manageCMUser: false,
  userPreference: false,
};

const appBarSlice = createSlice({
  name: 'appBar',
  initialState,
  reducers: {
    setHostConnection: (state, action) => {
      state.hostConnection = action.payload;
    },
    setAboutCubrid: (state, action) => {
      state.aboutCubrid = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setUpdatePassword: (state, action) => {
      state.updatePassword = action.payload;
    },
    setExportHost: (state, action) => {
      state.exportHost = action.payload;
    },
    setImportHost: (state, action) => {
      state.importHost = action.payload;
    },
    setBrokerLogParser: (state, action) => {
      state.brokerLogParser = action.payload;
    },
    setManageCMUser: (state, action) => {
      state.manageCMUser = action.payload;
    },
    setUserPreference: (state, action) => {
      state.userPreference = action.payload;
    }
  },
});

export const {
  setHostConnection,
  setAboutCubrid,
  setUpdatePassword,
  setProfile,
  setExportHost,
  setImportHost,
  setBrokerLogParser,
  setManageCMUser,
  setUserPreference,
} = appBarSlice.actions;
export default appBarSlice.reducer;
