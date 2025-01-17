import { gql } from '@apollo/client';
import { EpisodePlaybackDetails_episode as Episode } from '../types/api';
import EntityLink from './EntityLink';
import Flex from './Flex';
import { fragmentRegistry } from '../apollo/fragmentRegistry';

interface EpisodePlaybackDetailsProps {
  episode: Episode;
}

const EpisodePlaybackDetails = ({ episode }: EpisodePlaybackDetailsProps) => {
  return (
    <Flex direction="column" gap="0.25rem">
      <EntityLink className="text-sm" entity={episode}>
        {episode.name}
      </EntityLink>
      <EntityLink className="text-xs text-muted" entity={episode.show}>
        {episode.show.name}
      </EntityLink>
    </Flex>
  );
};

fragmentRegistry.register(gql`
  fragment EpisodePlaybackDetails_episode on Episode {
    name
    show {
      id
      name
    }
  }
`);

export default EpisodePlaybackDetails;
