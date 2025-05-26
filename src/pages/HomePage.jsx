import PageContainer from '../components/PageContainer';
import SnapSectionContainer from '../components/SnapSectionContainer';

const sections = [
  { id: 1, color: '#4B5563', title: 'Section 1' },
  { id: 2, color: '#1F1F1F', title: 'Section 2' },
  { id: 3, color: '#4B5563', title: 'Section 3' },
  { id: 4, color: '#1F1F1F', title: 'Section 4' },
  { id: 5, color: '#4B5563', title: 'Section 5' },
  { id: 6, color: '#1F1F1F', title: 'Section 6' },
];

const HomePage = () =>  {
  return (
    <PageContainer>
      <div className="scroll-snap-container">
        {sections.map((section) => (
          <SnapSectionContainer section={section} key={section.id}>
            <h1 className="text-5xl font-bold text-white">{section.title}</h1>
          </SnapSectionContainer>
        ))}
      </div>
    </PageContainer>
  );
}

export default HomePage;