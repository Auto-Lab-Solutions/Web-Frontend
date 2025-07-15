import PageContainer from '../components/common/PageContainer';
import { FacebookEmbed } from 'react-social-media-embed';

const NewsFeedPage = () => {
  return (
    <PageContainer>
      {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <FacebookEmbed url="https://www.facebook.com/andrewismusic/posts/451971596293956" width={550} />
      </div> */}
      <div className="flex justify-center h-142 bg-background-primary text-text-primary items-center">
        <h2 className="text-2xl font-semibold text-text-primary">Newsfeed is Coming Soon...</h2>
      </div>
    </PageContainer>
  );
}

export default NewsFeedPage;