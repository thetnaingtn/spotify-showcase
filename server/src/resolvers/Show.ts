import { ShowResolvers } from './types';
import { prop } from './helpers';

const resolvers: ShowResolvers = {
  description: ({ description, html_description }, { format }) => {
    return format === 'HTML' ? html_description : description;
  },
  episodes: (show, { limit, offset }, { dataSources }) => {
    return dataSources.spotify.getShowEpisodes(show.id, {
      limit: limit ?? undefined,
      offset: offset ?? undefined,
    });
  },
  externalUrls: prop('external_urls'),
  isExternallyHosted: prop('is_externally_hosted'),
  mediaType: prop('media_type'),
};

export default resolvers;
