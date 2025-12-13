import { useEffect, useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import { normalizeProfileImage } from "../utils/profileImage";
import { uploadUserAvatar } from "../features/user/userSlice";

function ProfileAvatar({ user, size = 80, editable = false, sx }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { avatarUploading } = useSelector((state) => state.user);
  const [imageUrl, setImageUrl] = useState(user?.profile_image_url || null);

  useEffect(() => {
    setImageUrl(user?.profile_image_url || null);
  }, [user]);

  const handleSelectFile = () => {
    if (!editable || !fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await dispatch(uploadUserAvatar(file));
    if (uploadUserAvatar.fulfilled.match(result)) {
      const updatedImage =
        result.payload?.profileImageUrl ||
        result.payload?.profile_image_url ||
        result.payload?.profile?.profile_image_url;
      if (updatedImage) {
        setImageUrl(updatedImage);
      }
    }
    event.target.value = "";
  };

  const avatarElement = (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <Avatar
        src={normalizeProfileImage(imageUrl)}
        imgProps={{ referrerPolicy: "no-referrer" }}
        sx={{ width: size, height: size, ...sx }}
      />
      {avatarUploading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
        >
          <CircularProgress size={Math.max(24, size / 3)} color="inherit" />
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {editable ? (
        <Tooltip title="Tap to upload">
          <Box sx={{ cursor: "pointer" }} onClick={handleSelectFile}>
            {avatarElement}
          </Box>
        </Tooltip>
      ) : (
        avatarElement
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={!editable}
      />
    </>
  );
}

export default ProfileAvatar;
