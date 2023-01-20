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
import TrackNumberCell from './TrackNumberCell';
import useResumePlaybackMutation from '../mutations/useResumePlaybackMutation';
import { useMemo } from 'react';

type Track = NonNullable<Get<Album, 'tracks.edges[0].node'>>;

interface AlbumTracksTableProps {
  album: Album;
}

const columnHelper = createColumnHelper<Track>();

const AlbumTracksTable = ({ album }: AlbumTracksTableProps) => {
  const [resumePlayback] = useResumePlaybackMutation();

  const columns = useMemo(
    () => [
      columnHelper.accessor((track) => track, {
        header: '#',
        meta: { shrink: true },
        cell: (info) => {
          return (
            <TrackNumberCell
              context={album}
              track={info.getValue()}
              position={info.row.index}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'title',
        header: 'Title',
        cell: (info) => {
          return (
            <AlbumTrackTitleCell album={album} track={info.row.original} />
          );
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
    ],
    [album]
  );

  return (
    <Table
      columns={columns}
      data={album.tracks?.edges.map((edge) => edge.node) ?? []}
      onDoubleClickRow={(row) => {
        const track = row.original;

        resumePlayback({
          contextUri: album.uri,
          offset: { uri: track.uri },
        });
      }}
      contextMenu={(row) => {
        const track = row.original;

        return (
          <>
            <ContextMenuAction.AddToQueue uri={track.uri} />
            <ContextMenu.Separator />
            <ContextMenuAction.LinkToArtist artists={track.artists} />
            <ContextMenu.Separator />
            <ContextMenu.SubMenu
              content={<ContextMenuAction.CopyLinkToEntity entity={track} />}
            >
              Share
            </ContextMenu.SubMenu>
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

      ...AlbumTrackTitleCell_album
    }

    ${AlbumTrackTitleCell.fragments.album}
    ${AlbumTrackTitleCell.fragments.track}
  `,
};

export default AlbumTracksTable;
