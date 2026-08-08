import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { assets } from '../../assets/assets';

const AddCourse = () => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [chapters, setChapters] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);

  const initialLectureDetails = {
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  };

  const [lectureDetails, setLectureDetails] = useState(initialLectureDetails);

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');

      if (!title?.trim()) return;

      const newChapter = {
        chapterId: crypto.randomUUID(),
        chapterTitle: title.trim(),
        chapterContent: [],
        collapsed: false,
        chapterOrder: chapters.length + 1,
      };

      setChapters((previousChapters) => [...previousChapters, newChapter]);
    }

    if (action === 'remove') {
      setChapters((previousChapters) =>
        previousChapters.filter((chapter) => chapter.chapterId !== chapterId)
      );
    }

    if (action === 'toggle') {
      setChapters((previousChapters) =>
        previousChapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    }
  };

  const openLecturePopup = (chapterId) => {
    setCurrentChapterId(chapterId);
    setLectureDetails(initialLectureDetails);
    setShowPopup(true);
  };

  const addLecture = () => {
    if (
      !lectureDetails.lectureTitle.trim() ||
      !lectureDetails.lectureDuration ||
      !lectureDetails.lectureUrl.trim()
    ) {
      alert('Please fill in the lecture title, duration, and URL.');
      return;
    }

    setChapters((previousChapters) =>
      previousChapters.map((chapter) =>
        chapter.chapterId === currentChapterId
          ? {
              ...chapter,
              chapterContent: [
                ...chapter.chapterContent,
                {
                  lectureId: crypto.randomUUID(),
                  ...lectureDetails,
                },
              ],
            }
          : chapter
      )
    );

    setShowPopup(false);
    setCurrentChapterId(null);
    setLectureDetails(initialLectureDetails);
  };

  const removeLecture = (chapterId, lectureId) => {
    setChapters((previousChapters) =>
      previousChapters.map((chapter) =>
        chapter.chapterId === chapterId
          ? {
              ...chapter,
              chapterContent: chapter.chapterContent.filter(
                (lecture) => lecture.lectureId !== lectureId
              ),
            }
          : chapter
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const courseData = {
      courseTitle,
      courseDescription: quillRef.current?.root.innerHTML || '',
      coursePrice,
      discount,
      image,
      chapters,
    };

    console.log(courseData);
    // Send courseData to your backend here.
  };

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md w-full text-gray-500"
      >
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            type="text"
            value={courseTitle}
            onChange={(event) => setCourseTitle(event.target.value)}
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div ref={editorRef} />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              type="number"
              value={coursePrice}
              onChange={(event) => setCoursePrice(event.target.value)}
              placeholder="0"
              min="0"
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>

          <div className="flex md:flex-row flex-col items-center gap-3">
            <p>Course Thumbnail</p>

            <label htmlFor="thumbnailImage" className="flex items-center gap-3 cursor-pointer">
              <img
                src={assets.file_upload_icon}
                alt="Upload thumbnail"
                className="p-3 bg-blue-500 rounded"
              />

              <input
                type="file"
                id="thumbnailImage"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
                accept="image/*"
                hidden
              />
            </label>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Course thumbnail preview"
                className="max-h-24 max-w-24 object-cover rounded"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p>Discount %</p>
          <input
            type="number"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            placeholder="0"
            min="0"
            max="100"
            className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            required
          />
        </div>

        <div>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className="bg-white border rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  <img
                    src={assets.dropdown_icon}
                    alt="Toggle chapter"
                    width={14}
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    className={`mr-2 cursor-pointer transition-all ${
                      chapter.collapsed ? '-rotate-90' : ''
                    }`}
                  />

                  <span className="font-semibold">
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>

                <span className="text-gray-500">
                  {chapter.chapterContent.length} Lectures
                </span>

                <img
                  src={assets.cross_icon}
                  alt="Remove chapter"
                  onClick={() => handleChapter('remove', chapter.chapterId)}
                  className="cursor-pointer"
                />
              </div>

              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lecture.lectureId}
                      className="flex justify-between items-center mb-2 gap-2"
                    >
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} -{' '}
                        {lecture.lectureDuration} mins -{' '}
                        <a
                          href={lecture.lectureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500"
                        >
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>

                      <img
                        src={assets.cross_icon}
                        alt="Remove lecture"
                        onClick={() =>
                          removeLecture(chapter.chapterId, lecture.lectureId)
                        }
                        className="cursor-pointer"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => openLecturePopup(chapter.chapterId)}
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                  >
                    + Add Lecture
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleChapter('add')}
            className="w-full flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer"
          >
            + Add Chapter
          </button>
        </div>

        <button
          type="submit"
          className="bg-black text-white w-max py-2.5 px-8 rounded my-4"
        >
          ADD
        </button>
      </form>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
          <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
            <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>

            <div className="mb-2">
              <p>Lecture Title</p>
              <input
                type="text"
                className="mt-1 block w-full border rounded py-1 px-2"
                value={lectureDetails.lectureTitle}
                onChange={(event) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureTitle: event.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <p>Duration (minutes)</p>
              <input
                type="number"
                className="mt-1 block w-full border rounded py-1 px-2"
                value={lectureDetails.lectureDuration}
                onChange={(event) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureDuration: event.target.value,
                  })
                }
              />
            </div>

            <div className="mb-2">
              <p>Lecture URL</p>
              <input
                type="url"
                className="mt-1 block w-full border rounded py-1 px-2"
                value={lectureDetails.lectureUrl}
                onChange={(event) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureUrl: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-2 my-4">
              <p>Is Preview Free?</p>
              <input
                type="checkbox"
                className="mt-1 scale-125"
                checked={lectureDetails.isPreviewFree}
                onChange={(event) =>
                  setLectureDetails({
                    ...lectureDetails,
                    isPreviewFree: event.target.checked,
                  })
                }
              />
            </div>

            <button
              type="button"
              onClick={addLecture}
              className="w-full bg-blue-400 text-white px-4 py-2 rounded"
            >
              Add
            </button>

            <img
              src={assets.cross_icon}
              alt="Close"
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 w-4 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;