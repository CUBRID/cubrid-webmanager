import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hostHeight: 200,
  backupModal: { open: false },
  queryPlanModal: { open: false },
  createDBUser: { open: false },
  paramDump: { open: false },
  planDump: { open: false },
  optimizeDB: { open: false },
  compactDB: { open: false },
  checkDB: { open: false },
  changeCMPassword: { open: false },
  renameDB: { open: false },
  deleteDB: { open: false },
  backupDB: { open: false },
  restoreDB: { open: false },
  copyDB: { open: false },
  addVolume: { open: false },
  autoVolume: { open: false },
  unloadDB: {open: false},
  loadDB: {open: false}
};

const sideNavSlice = createSlice({
  name: 'sidenav',
  initialState,
  reducers: {
    setHostHeight: (state, action) => {
      state.hostHeight = action.payload;
    },
    setBackupModal: (state, action) => {
      state.backupModal = action.payload;
    },
    setQueryPlanModal: (state, action) => {
      state.queryPlanModal = action.payload;
    },
    setCreateDBUser: (state, action) => {
      state.createDBUser = action.payload;
    },
    setParamDump: (state, action) => {
      state.paramDump = action.payload;
    },
    setPlanDump: (state, action) => {
      state.planDump = action.payload;
    },
    setOptimizeDB: (state, action) => {
      state.optimizeDB = action.payload;
    },
    setChangeCMPassword: (state, action) => {
      state.changeCMPassword = action.payload;
    },
    setCompactDB: (state, action) => {
      state.compactDB = action.payload;
    },
    setCheckDB: (state, action) => {
      state.checkDB = action.payload;
    },
    setRenameDB: (state, action) => {
      state.renameDB = action.payload;
    },
    setDeleteDB: (state, action) => {
      state.deleteDB = action.payload;
    },
    setBackupDB: (state, action) => {
      state.backupDB = action.payload;
    },
    setRestoreDB: (state, action) => {
      state.restoreDB = action.payload;
    },
    setCopyDB: (state, action) => {
      state.copyDB = action.payload;
    },
    setAddVolume: (state, action) => {
      state.addVolume = action.payload;
    },
    setAutoVolume: (state, action) => {
      state.autoVolume = action.payload;
    },
    setUnloadDB: (state, action) => {
      state.unloadDB = action.payload;
    },
    setLoadDB: (state, action) => {
      state.loadDB = action.payload;
    }
  },
});

export const {
  setHostHeight,
  setBackupModal,
  setQueryPlanModal,
  setCreateDBUser,
  setParamDump,
  setPlanDump,
  setOptimizeDB,
  setChangeCMPassword,
  setCompactDB,
  setCheckDB,
  setRenameDB,
  setDeleteDB,
  setBackupDB,
  setRestoreDB,
  setCopyDB,
  setAddVolume,
  setAutoVolume,
  setUnloadDB,
  setLoadDB
} = sideNavSlice.actions;
export default sideNavSlice.reducer;
