import { put, call, takeLatest } from 'redux-saga/effects';
import { getArtistsApi } from '@services/artistApi';
import { artistContainerTypes, artistContainerCreators } from './reducer';

const { REQUEST_GET_ARTISTS } = artistContainerTypes;
const { successGetArtists, failureGetArtists } = artistContainerCreators;

export function* getArtists(action) {
  const response = yield call(getArtistsApi, action.artistName);
  const { data, ok } = response;
  if (ok) {
    yield put(successGetArtists(data));
  } else {
    yield put(failureGetArtists(data));
  }
}
// Individual exports for testing
export default function* artistContainerSaga() {
  yield takeLatest(REQUEST_GET_ARTISTS, getArtists);
}
