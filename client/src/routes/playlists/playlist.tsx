import { useParams } from 'react-router-dom';
import {
  gql,
  useSuspenseQuery_experimental as useSuspenseQuery,
} from '@apollo/client';
import { PlaylistQuery, PlaylistQueryVariables } from '../../types/api';
import EntityLink from '../../components/EntityLink';
import Flex from '../../components/Flex';
import Page from '../../components/Page';
import useSetBackgroundColorFromImage from '../../hooks/useSetBackgroundColorFromImage';
import styles from './playlist.module.scss';
import PlaylistTable from '../../components/PlaylistTable';
import Skeleton from '../../components/Skeleton';

const PLAYLIST_QUERY = gql`
  query PlaylistQuery($id: ID!) {
    playlist(id: $id) {
      id
      name
      images {
        url
      }
      owner {
        id
        displayName
      }
      tracks {
        edges {
          ...PlaylistTable_playlistTrackEdges
        }
        pageInfo {
          total
        }
      }
    }
  }

  ${PlaylistTable.fragments.playlistTrackEdges}
`;

const Playlist = () => {
  const { playlistId } = useParams() as { playlistId: 'string' };
  const { data } = useSuspenseQuery<PlaylistQuery, PlaylistQueryVariables>(
    PLAYLIST_QUERY,
    { variables: { id: playlistId } }
  );

  const playlist = data.playlist!;
  const { tracks } = playlist;
  const images = playlist.images ?? [];
  const coverPhoto = images[0];

  useSetBackgroundColorFromImage(coverPhoto?.url, {
    fallback: 'rgba(var(--background--surface--rgb), 0.5)',
  });

  return (
    <Page>
      <Page.Header>
        <Page.CoverPhoto src={coverPhoto?.url} />
        <Page.HeaderDetails>
          <Page.MediaType mediaType="playlist" />
          <Page.Title>{playlist.name}</Page.Title>
          <Page.Details
            items={[
              <EntityLink entity={playlist.owner}>
                {playlist.owner.displayName}
              </EntityLink>,
              <span>
                {tracks.pageInfo.total}{' '}
                {tracks.pageInfo.total === 1 ? 'song' : 'songs'}
              </span>,
            ]}
          ></Page.Details>
        </Page.HeaderDetails>
      </Page.Header>
      <Page.Content>
        <PlaylistTable playlistTrackEdges={playlist.tracks.edges} />
      </Page.Content>
    </Page>
  );
};

export const Loading = () => (
  <Page>
    <Page.Header>
      <Skeleton.CoverPhoto size="250px" />
      <Page.HeaderDetails>
        <Skeleton.Heading level={1} width="50%" fontSize="5rem" />
        <Skeleton.Text width="20%" />
      </Page.HeaderDetails>
    </Page.Header>
    <Page.Content>
      <Skeleton.Table
        rows={10}
        columns={[
          <Skeleton.Text />,
          <Flex gap="0.5rem" alignItems="end">
            <Skeleton.CoverPhoto size="2.5rem" />
            <Flex direction="column" flex={1} gap="0.5rem">
              <Skeleton.Text width="25%" fontSize="1rem" />
              <Skeleton.Text width="20%" fontSize="0.75rem" />
            </Flex>
          </Flex>,
          <Skeleton.Text />,
          <Skeleton.Text />,
        ]}
      />
    </Page.Content>
  </Page>
);

export default Playlist;
