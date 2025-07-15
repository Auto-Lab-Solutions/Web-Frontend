import { companyMapLink } from '../metaData';

const GoogleMapEmbed = () => {
  const mapsUrl = companyMapLink;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-border-primary">
      <iframe
        title="Google Map"
        src={mapsUrl}
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        className="border-0 mx-auto block"
      ></iframe>
    </div>
  );
};

export default GoogleMapEmbed;
