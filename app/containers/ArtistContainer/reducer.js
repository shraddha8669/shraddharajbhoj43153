/*
 *
 * ArtistContainer reducer
 *
 */
import produce from 'immer';
import { createActions } from 'reduxsauce';
import get from 'lodash/get';

export const { Types: artistContainerTypes, Creators: artistContainerCreators } = createActions({
  requestGetArtists: ['artistName'],
  successGetArtists: ['data'],
  failureGetArtists: ['error'],
  clearArtists: []
});
export const initialState = { artistName: null, artistsData: [], artistsError: null };

/* eslint-disable default-case, no-param-reassign */
export const artistContainerReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case artistContainerTypes.REQUEST_GET_ARTISTS:
        draft.artistName = action.artistName;
        break;
      case artistContainerTypes.CLEAR_ARTISTS:
        return initialState;
      case artistContainerTypes.SUCCESS_GET_ARTISTS:
        draft.artistsData = action.data;
        break;
      case artistContainerTypes.FAILURE_GET_ARTISTS:
        draft.artistsError = { error: get(action.error, 'message', 'something_went_wrong') };
        draft.artistsData = null;
        break;
    }
  });

export default artistContainerReducer;
