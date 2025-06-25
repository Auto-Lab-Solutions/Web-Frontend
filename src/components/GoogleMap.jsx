
const GoogleMapEmbed = () => {
  const mapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.1358526901827!2d115.93484588994839!3d-31.988424921166033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2a32bd151492dc2f%3A0x63cadc40b16b2176!2sPerth%20Cars%20Pre-Purchase%20Inspection%20Service!5e0!3m2!1sen!2slk!4v1750826884985!5m2!1sen!2slk";
  const linkUrl = "https://www.google.com/maps/place/Perth+Cars+Pre-Purchase+Inspection+Service/@-31.9898836,115.9302042,15.95z/data=!4m14!1m7!3m6!1s0x2a32bd151492dc2f:0x63cadc40b16b2176!2sPerth+Cars+Pre-Purchase+Inspection+Service!8m2!3d-31.9887171!4d115.9350593!16s%2Fg%2F11x1ls0pj5!3m5!1s0x2a32bd151492dc2f:0x63cadc40b16b2176!8m2!3d-31.9887171!4d115.9350593!16s%2Fg%2F11x1ls0pj5?entry=ttu&g_ep=EgoyMDI1MDYyMi4wIKXMDSoASAFQAw%3D%3D";

  return (
    <div className="w-full h-[300px] relative rounded-xl overflow-hidden">
      <iframe
        title="Google Map"
        src={mapsUrl}
        width="80%"
        height="100%"
        loading="lazy"
        allowFullScreen
        className="border-0 mx-auto block mt-8"
      ></iframe>
    </div>
  );
};

export default GoogleMapEmbed;
