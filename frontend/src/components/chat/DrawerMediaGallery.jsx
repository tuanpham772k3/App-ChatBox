import React from "react";
import { Drawer } from "antd";
import { SlArrowLeft } from "react-icons/sl";
import { Ellipsis, Forward } from "lucide-react";

const DrawerMediaGallery = ({ open, onClose, images }) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      closable={false}
      width="min(100vw, 26.875rem)"
      placement="right"
      title={
        <div className="relative flex items-center justify-center">
          <button
            onClick={onClose}
            className="lg:hidden absolute left-0 p-2 rounded-full hover:bg-gray-100"
          >
            <SlArrowLeft size={18} />
          </button>
          <span className="text-lg font-semibold">Ảnh/Video</span>
        </div>
      }
      styles={{ body: { padding: 12 } }}
    >
      {images.length === 0 ? (
        <p className="text-sm text-center text-[var(--color-text-secondary)]">
          Chưa có ảnh nào
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img._id} className="relative cursor-pointer group">
              <img
                src={img.file.url}
                alt="media"
                className="w-full aspect-square object-cover rounded"
              />

              {/* Overlay */}
              <div className="absolute inset-0 rounded hover:bg-black/20" />

              {/* Action */}
              <div
                className="absolute top-1 right-1 flex items-center p-0.5 text-center rounded bg-[var(--color-chat)]
                opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
              >
                <button className="p-1 rounded hover:bg-black/10">
                  <Forward size={18} color="var(--color-text-primary)" />
                </button>
                <button className="p-1 rounded hover:bg-black/10">
                  <Ellipsis size={18} color="var(--color-text-primary)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

export default DrawerMediaGallery;
