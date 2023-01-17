import { gql, useMutation, Reference } from '@apollo/client';
import {
  RemoveSavedTracksMutation,
  RemoveSavedTracksMutationVariables,
  RemoveSavedTracksInput,
} from '../types/api';
import { useCallback } from 'react';

const REMOVE_SAVED_TRACKS_MUTATION = gql`
  mutation RemoveSavedTracksMutation($input: RemoveSavedTracksInput!) {
    removeSavedTracks(input: $input) {
      removedTracks {
        id
      }
    }
  }
`;

const useRemoveSavedTracksMutation = () => {
  const [execute, result] = useMutation<
    RemoveSavedTracksMutation,
    RemoveSavedTracksMutationVariables
  >(REMOVE_SAVED_TRACKS_MUTATION);

  const removeSavedTracks = useCallback(
    (input: RemoveSavedTracksInput) => {
      return execute({
        variables: { input },
        optimisticResponse: {
          removeSavedTracks: {
            __typename: 'RemoveSavedTracksPayload',
            removedTracks: input.ids.map((id) => ({ __typename: 'Track', id })),
          },
        },
        update: (cache, { data }) => {
          if (!data?.removeSavedTracks?.removedTracks) {
            return;
          }

          cache.modify({
            id: cache.identify({ __typename: 'CurrentUser' }),
            fields: {
              tracks: (existing, { readField }) => {
                return {
                  ...existing,
                  edges: input.ids.reduce<Reference[]>(
                    (edgeRefs, id) => {
                      return edgeRefs.filter((edgeRef) => {
                        const node = readField<Reference>('node', edgeRef);

                        return id !== readField('id', node);
                      });
                    },
                    [...(readField<Reference[]>('edges', existing) ?? [])]
                  ),
                };
              },
              tracksContains(existing: Record<string, boolean>) {
                return input.ids.reduce(
                  (memo, id) => ({ ...memo, [id]: false }),
                  existing
                );
              },
            },
          });
        },
      });
    },
    [execute]
  );

  return [removeSavedTracks, result] as const;
};

export default useRemoveSavedTracksMutation;