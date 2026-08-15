import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from 'humanize-duration'
import { useAuth, useUser } from '@clerk/react';

export const AppContext = createContext();

export const AppContextProvider = (props)=> {

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user} = useUser()

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(true)
    const [enrolledCourses, setEnrolledCourses] = useState([])

    // Fetch All courses
    const fetchAllCourses = async ()=> {
        setAllCourses(dummyCourses)
    }

    const logToken = async() => {
        console.log(await getToken());

    }

    useEffect(() => {
        fetchAllCourses()
        fetchUserEnrolledCourses()
    },[])

    useEffect(() => {
        if(user){
            logToken();
        }
    },[user])

    // function to update user to educator
    const updateRoleToEducator = async () => {
    try {
        const token = await getToken();

        const response = await fetch(
            "http://localhost:5000/api/educator/update-role",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log(data);

        return data;

    } catch (error) {
        console.error("Update role error:", error);
    }
};

    // Function to calculate average rating of course
    const calculatingRating = (course) => {
        if(course.courseRatings.length === 0){
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return totalRating / course.courseRatings.length
    }

    // function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)

        return humanizeDuration(time * 60 * 1000 , {units: ["h", "m"]})
    }

    // function to calculate course duration
    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map((chapter) => chapter.chapterContent.map((lecture) => time += lecture.lectureDuration))

        return humanizeDuration(time * 60 * 1000 , {units: ["h", "m"]})
    }

    //function calculate to Np of lectures in the course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length ;
            }
        })

        return totalLectures;
    }

    // fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses)
    }

    const value = {
       currency, allCourses, navigate, calculatingRating ,isEducator , setIsEducator, calculateNoOfLectures,calculateCourseDuration, calculateChapterTime, enrolledCourses, fetchUserEnrolledCourses , updateRoleToEducator
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}