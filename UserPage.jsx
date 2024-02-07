import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import GuestSideBar from "../components/GuestSideBar/GuestSideBar";
import GuestThreeJs from "../components/GuestThreeJs/GuestThreeJs";
import axios from "axios";

const UserPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    //  const searchParams = location.search;
    //  const query = queryString.parse(searchParams); //사용
    //  const [buildingId, setBuildingId] = useState(query.buildingId); // 건물 아이디


    const [buildingId, setBuildingId] = useState(queryParams.get("buildingId")); // 건물 아이디
    let [gltfBlobUrl, setGltfBlobUrl] = useState(null); //  gltf 파일 blob url

    const [jsonData, setJsonData] = useState({});

        // 건물 파일 불러오기
    const fetchBuilding = (buildingId) => {
        const url = `/guest/${buildingId}`;
        axios.get(url, { responseType: 'blob' }) // Blob 형태로 받아옵니다.
            .then(response => {
                const blob = response.data;
                const blobUrl = URL.createObjectURL(blob); // Blob URL을 생성합니다.
                setGltfBlobUrl(blobUrl); // Blob URL을 상태로 저장합니다.
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    useEffect(()=>{
        fetchBuilding(buildingId);
    },[])
    

    return (
        <>
            <div>
                <GuestThreeJs gltfBlobUrl={gltfBlobUrl} jsonData={jsonData} buildingId={buildingId}/>
            </div>
        </>
    );
}
export default UserPage;