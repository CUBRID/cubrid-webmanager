import { createSlice } from '@reduxjs/toolkit';
import { getIntervalDashboard } from '@/preference/pref.js';

const initialState = {
  intervalDashboard: getIntervalDashboard(), // default = 10, 0 is no refresh
  buffering: false,
  deleteConfirm: { open: false },
  errorModal: { open: false },
  successModal: { open: false },
  selectedObject: null,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIntervalDashboard: (state, action) => {
      state.intervalDashboard = action.payload;
    },
    setBuffering: (state, action) => {
      state.buffering = action.payload;
    },
    setDeleteConfirm: (state, action) => {
      state.deleteConfirm = action.payload;
    },
    setErrorModal: (state, action) => {
      state.errorModal = action.payload;
    },
    setSuccessModal: (state, action) => {
      state.successModal = action.payload;
    },
    setSelectedObject: (state, action) => {
      state.selectedObject = action.payload;
    }
  },
});

export const {
  setIntervalDashboard,
  setBuffering,
  setDeleteConfirm,
  setErrorModal ,
  setSuccessModal,
  setSelectedObject,
} = globalSlice.actions;
export default globalSlice.reducer;
