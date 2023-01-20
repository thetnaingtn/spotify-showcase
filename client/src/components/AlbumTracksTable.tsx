import { gql } from '@apollo/client';
import { createColumnHelper } from '@tanstack/react-table';
import { Clock } from 'lucide-react';
import { Get } from 'type-fest';
import { AlbumTracksTable_album as Album } from '../types/api';
import AlbumTrackTitleCell from './AlbumTrackTitleCell';
import ContextMenu from './ContextMenu';
import ContextMenuAction from './ContextMenuAction';
import Duration from './Duration';
import Table from './Table';

type Track = NonNullable<Get<Album, 'tracks.edges[0].node'>>;

interface AlbumTracksTableProps {
  album: Album;
}

const columnHelper = createColumnHelper<Track>();

const columns = [
  columnHelper.accessor('trackNumber', { header: '#', meta: { shrink: true } }),
  columnHelper.display({
    id: 'title',
    header: 'Title',
    cell: (info) => {
      return <AlbumTrackTitleCell track={info.row.original} />;
    },
  }),
  columnHelper.accessor('durationMs', {
    header: () => <Clock size="1rem" />,
    cell: (info) => <Duration durationMs={info.getValue()} />,
    meta: {
      headerAlign: 'right',
      shrink: true,
    },
  }),
];

const AlbumTracksTable = ({ album }: AlbumTracksTableProps) => {
  return (
    <Table
      columns={columns}
      data={album.tracks?.edges.map((edge) => edge.node) ?? []}
      contextMenu={(row) => {
        const track = row.original;

        return (
          <>
            <ContextMenuAction.AddToQueue uri={track.uri} />
            <ContextMenu.Separator />
            <ContextMenu.Link to={`/artists/${track.artists[0].id}`}>
              Go to artist
            </ContextMenu.Link>
            <ContextMenu.Separator />
            <ContextMenuAction.OpenDesktopApp uri={track.uri} context={album} />
          </>
        );
      }}
    />
  );
};

AlbumTracksTable.fragments = {
  album: gql`
    fragment AlbumTracksTable_album on Album {
      id
      uri
      tracks {
        edges {
          node {
            id
            uri
            durationMs
            trackNumber
            artists {
              id
            }

            ...AlbumTrackTitleCell_track
          }
        }
      }
    }

    ${AlbumTrackTitleCell.fragments.track}
  `,
};

export default AlbumTracksTable;
