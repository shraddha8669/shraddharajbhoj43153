import T from '@components/T';
import { Card, Input, Skeleton } from 'antd';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { memo, useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { artistContainerCreators } from './reducer';
import saga from './saga';
import { selectArtistContainer, selectArtistData, selectArtistError, selectArtistName } from './selectors';

const { Search } = Input;

const Container = styled.div`
  && {
    display: flex;
    flex-direction: column;
    max-width: ${props => props.maxwidth}px;
    width: 100%;
    margin: 0 auto;
    padding: ${props => props.padding}px;
  }
`;

const CustomCard = styled(Card)`
  && {
    margin: 20px 0;
    max-width: ${props => props.maxwidth};
    color: ${props => props.color};
    ${props => props.color && `color: ${props.color}`};
  }
`;

export function ArtistContainer({
  dispatchGetArtists,
  dispatchClearArtists,
  intl,
  artistsData = {},
  artistsError = null,
  artistName,
  maxwidth,
  padding
}) {
  useInjectSaga({ key: 'artistContainer', saga });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loaded = get(artistsData, 'results', null) || artistsError;
    if (loading && loaded) {
      setLoading(false);
      if (loaded && !artistName) {
        dispatchClearArtists();
      }
    }
  }, [artistsData, artistsError]);

  useEffect(() => {
    if (artistName && !artistsData?.results?.length) {
      dispatchGetArtists(artistName);
      setLoading(true);
    }
  }, []);

  const handleOnChange = keyword => {
    if (!isEmpty(keyword)) {
      dispatchGetArtists(keyword);
      if (!artistsError?.error) {
        setLoading(true);
      }
    } else {
      dispatchClearArtists();
    }
  };
  const debouncedHandleOnChange = debounce(handleOnChange, 200);

  const renderArtistList = () => {
    const items = get(artistsData, 'results', []);
    const totalCount = get(artistsData, 'resultCount', 0);
    return (
      (items.length !== 0 || loading) && (
        <CustomCard>
          <Skeleton loading={loading} active>
            {artistName && (
              <div>
                <T id="search_query_artist" values={{ artistName }} />
              </div>
            )}
            {totalCount !== 0 && (
              <div>
                <T id="matching_artists" values={{ totalCount }} />
              </div>
            )}
            {items.map((item, index) => (
              <CustomCard key={index}>
                <T id="artist_name" values={{ name: item.artistName }} />
                <T id="track_name" values={{ trackName: item.trackName }} />
                <T id="genre" values={{ genre: item.primaryGenreName }} />
              </CustomCard>
            ))}
          </Skeleton>
        </CustomCard>
      )
    );
  };

  const renderErrorState = () => {
    let artistApiError;
    const results = get(artistsData, 'results', null);
    if (artistsError) {
      artistApiError = artistsError.error;
    } else if (!results?.length && artistName) {
      artistApiError = 'no_results_found';
    } else {
      artistApiError = 'artist_search_default';
    }
    return (
      !loading &&
      artistApiError &&
      !results?.length && (
        <CustomCard color={artistsError ? 'red' : 'grey'} title={intl.formatMessage({ id: 'artist_list' })}>
          <T id={artistApiError} />
        </CustomCard>
      )
    );
  };

  return (
    <Container maxwidth={maxwidth} padding={padding}>
      <CustomCard title={intl.formatMessage({ id: 'artist_search' })} maxwidth={maxwidth}>
        <Search
          data-testid="search-bar"
          defaultValue={artistName}
          type="text"
          onChange={evt => {
            debouncedHandleOnChange(evt.target.value);
          }}
          onSearch={searchText => debouncedHandleOnChange(searchText)}
        />
      </CustomCard>
      {renderArtistList()}
      {renderErrorState()}
    </Container>
  );
}

ArtistContainer.propTypes = {
  dispatchGetArtists: PropTypes.func,
  dispatchClearArtists: PropTypes.func,
  intl: PropTypes.object,
  artistsData: PropTypes.shape({
    resultCount: PropTypes.number,
    results: PropTypes.array
  }),
  artistsError: PropTypes.object,
  artistName: PropTypes.string,
  history: PropTypes.object,
  maxwidth: PropTypes.number,
  padding: PropTypes.number
};

const mapStateToProps = createStructuredSelector({
  artistContainer: selectArtistContainer(),
  artistsData: selectArtistData(),
  artistsError: selectArtistError(),
  artistName: selectArtistName()
});

function mapDispatchToProps(dispatch) {
  const { requestGetArtists, clearArtists } = artistContainerCreators;
  return {
    dispatchGetArtists: artistName => dispatch(requestGetArtists(artistName)),
    dispatchClearArtists: () => dispatch(clearArtists())
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  injectIntl,
  withConnect,
  memo
)(ArtistContainer);

export const ArtistContainerTest = compose(injectIntl)(ArtistContainer);
