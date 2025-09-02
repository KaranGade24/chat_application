import React from "react";
import styles from "./SelectedFilesPreview.module.css";
import { FileText, Image as ImageIcon, X } from "lucide-react";
import { ClipLoader } from "react-spinners";

const getFileType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  return "file";
};

const SelectedFilesPreview = ({ files, onRemoveFile, loading }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className={styles.previewContainer}>
      <div className={styles.filesWrapper}>
        {files.map((file, idx) => {
          const type = getFileType(file);

          return (
            <div key={idx} className={styles.fileCard}>
              <button
                className={styles.removeButton}
                onClick={() => onRemoveFile(idx)}
                title="Remove"
              >
                <X size={16} />
              </button>

              {!loading && type === "image" ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file?.name}
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.genericFile}>
                  <FileText size={28} />
                  <span className={styles.fileName}>{file?.name}</span>
                </div>
              )}
              {loading && (
                <div className={styles.loadingSpinner}>
                  <ClipLoader size={30} color="blue" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedFilesPreview;
