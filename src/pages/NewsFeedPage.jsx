import PageContainer from "../components/PageContainer";
import { FacebookEmbed } from 'react-social-media-embed';

const NewsFeedPage = () => {
  return (
    <PageContainer>
      <h1>Newsfeed Page</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <FacebookEmbed url="https://www.facebook.com/andrewismusic/posts/451971596293956" width={550} />
      </div>
    </PageContainer>
  );
}

export default NewsFeedPage;