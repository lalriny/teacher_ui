import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import api from "../api/apiClient";
import "../styles/study-materials.css";

export default function StudyMaterials() {

  const navigate = useNavigate();
  const { chapterId } = useParams();

  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    if (!chapterId) return;
    loadMaterials();
  }, [chapterId]);

  const loadMaterials = async () => {

    try {

      const res = await api.get(
        `/materials/chapters/${chapterId}/materials/`
      );

      setMaterials(res.data);

    } catch (err) {

      console.error("Failed to load materials:", err);

    }

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this material?")) return;

    try {

      await api.delete(
        `/materials/materials/${id}/`
      );

      setMaterials((prev) =>
        prev.filter((m) => m.id !== id)
      );

    } catch (err) {

      console.error("Delete failed:", err);

    }

  };

  const handleAddMaterial = () => {

    navigate(
      `/teacher/chapters/${chapterId}/study-materials/upload`
    );

  };

  return (

    <div className="study-materials-page">

      <button
        className="sm-back-btn"
        onClick={() => navigate(-1)}
      >
        <IoChevronBack /> Back
      </button>

      <div className="sm-title-container">

        <h2 className="sm-title">
          Study Materials
        </h2>

        <div className="sm-search">
          <input type="text" placeholder="Search" />
          <FiSearch className="sm-search-icon" />
        </div>

      </div>

      <div className="sm-list-container">

        <div className="sm-actions">

          <button
            className="sm-add-btn"
            onClick={handleAddMaterial}
          >
            + Add Study Material
          </button>

        </div>

        <div className="sm-table-header">

          <span className="sm-col-name">Name</span>
          <span className="sm-col-date">Date</span>
          <span className="sm-col-files">Files</span>
          <span className="sm-col-actions"></span>

        </div>

        {materials.length === 0 ? (

          <p className="sm-empty">
            No study materials uploaded yet.
          </p>

        ) : (

          <div className="sm-list">

            {materials.map((material) => (

              <div className="sm-row" key={material.id}>

                <span className="sm-col-name">
                  {material.title}
                </span>

                <span className="sm-col-date">
                  {new Date(material.created_at).toLocaleDateString()}
                </span>

                <span className="sm-col-files">
                  {material.files?.length || 0} files
                </span>

                <div className="sm-col-actions">

                  <button
                    className="sm-view-btn"
                    onClick={() =>
                      navigate(
                        `/teacher/chapters/${chapterId}/study-materials/${material.id}`,
                        { state: material }
                      )
                    }
                  >
                    View
                  </button>

                  <button
                    className="sm-delete-btn"
                    onClick={() => handleDelete(material.id)}
                  >
                    <MdDelete />
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}