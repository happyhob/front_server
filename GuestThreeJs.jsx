// 필요한 리액트 및 써드파티 라이브러리들을 import 합니다.
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import "../ThreeJs/ThreeJs.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import axios from "axios";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import * as Swal from "../../apis/alert";

// 도면 3D 모델을 렌더링하는 Model 컴포넌트
const Model = ({ url,onObjectClick, setnewgltf, setModifiedObjects, findObj }) => {
    const [gltf, setGltf] = useState(null);
    const meshRef = useRef();
    const { camera } = useThree();
    const [renderCount, setRenderCount] = useState(0);
    const objects = [];


    //랜더링 될 때 가져온 glb 파일을 로드한다
    useEffect(() => {
        // GLTF 모델을 로드하고 meshRef에 저장합니다.
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            setRenderCount(0);
            setGltf(gltf.scene);
            setnewgltf(gltf.scene)
        });
    }, [url]);

    // 모델의 클릭 이벤트 핸들링 및 선택된 오브젝트 상태 업데이트
    useEffect(() => {
        if (!meshRef.current) {
            return;
        }
        const handleClick = (event) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(meshRef.current.children, true);

            if (intersects.length > 0) {
                onObjectClick(intersects[0].object);
                setModifiedObjects((prevObjects) => ({
                    ...prevObjects,
                    [intersects[0].object.uuid]: intersects[0].object
                }));
            }
        };

        const primitive = meshRef.current;
        primitive.addEventListener('click', handleClick);

        setRenderCount(prevCount => prevCount + 1);


        if(renderCount<=1){
            handleClick({ clientX: window.innerWidth / 2 -1, clientY: window.innerHeight / 2 -1});
            gltf.traverse((child) => {
                if (child instanceof THREE.Mesh && child.name.includes('polygon3')) {
                    objects.push(child)
                    handleClick({ clientX: child.position.x, clientY: child.position.y });
                }
            });

        }

        return () => {
            primitive.removeEventListener('click', handleClick);
        };
    }, [onObjectClick, setModifiedObjects, camera, meshRef]);

    // 렌더링
    return gltf ? (
        <group
            ref={meshRef}
            onClick={(event) => {
                event.stopPropagation();
                onObjectClick(event.object);
            }}
        >
            <primitive object={gltf} scale={0.01}/>
        </group>
    ) : null;
};

// 건물 3D 모델을 렌더링하는 Model 컴포넌트
const Model2 = ({ url,onObjectClick, setnewgltf, setModifiedObjects }) => {
    const [gltf, setGltf] = useState(null);
    const meshRef = useRef();
    const { camera } = useThree();



    //랜더링 될 때 가져온 glb 파일을 로드한다
    useEffect(() => {
        // GLTF 모델을 로드하고 meshRef에 저장합니다.
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            setGltf(gltf.scene);
            setnewgltf(gltf.scene)
        });
    }, [url]);

    // 모델의 클릭 이벤트 핸들링 및 선택된 오브젝트 상태 업데이트
    useEffect(() => {
        if (!meshRef.current) {
            return;
        }
        const handleClick = (event) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(meshRef.current.children, true);

            if (intersects.length > 0) {
                onObjectClick(intersects[0].object);
                setModifiedObjects((prevObjects) => ({
                    ...prevObjects,
                    [intersects[0].object.uuid]: intersects[0].object
                }));
            }
        };

        const primitive = meshRef.current;
        primitive.addEventListener('click', handleClick);

        return () => {
            primitive.removeEventListener('click', handleClick);
        };
    }, [onObjectClick, setModifiedObjects, camera, meshRef]);

    // 렌더링
    return gltf ? (
        <group
            ref={meshRef}
            onClick={(event) => {
                event.stopPropagation();
                onObjectClick(event.object);
            }}
        >
            <primitive object={gltf} scale={0.01}/>
        </group>
    ) : null;
};

// 오브젝트의 세부 정보를 수정하는 Form 컴포넌트
const ObjectDetailsForm = ({ objectDetails, setObjectDetails, onCancel, jsonData, selectedObject }) => {
    // 선택된 오브젝트 정보로 폼 필드 초기화
    const populateFormFields = () => {
        if (!selectedObject || !jsonData) {
            return;
        }

        const clickedObjectData = jsonData[selectedObject.name];

        if (clickedObjectData) {
            setObjectDetails((prevDetails) => ({
                ...prevDetails,
                roomName: clickedObjectData.roomName || '',
                info: (clickedObjectData.info || {}).map(([key, value]) => ({ key, value })) || []
            }));
        }
    };

    // useEffect를 사용하여 선택된 오브젝트가 변경될 때 폼 필드 업데이트
    useEffect(() => {
        if (selectedObject) {
            populateFormFields();
        }
    }, [selectedObject, jsonData]);

    // 입력 필드 변경 이벤트 핸들러
    const handleInfoInputChange = (e, index, type) => {
        setObjectDetails((prevDetails) => {
            const newInfo = [...prevDetails.info];
            const item = newInfo[index];

            if (type === 'key') {
                return {
                    ...prevDetails,
                    info: newInfo.map((infoItem, i) => (i === index ? { ...infoItem, key: e.target.value } : infoItem))
                };
            } else if (type === 'value') {
                item.value = e.target.value;
            }

            return {
                ...prevDetails,
                info: newInfo
            };
        });
    };

    // 메타데이터 필드 추가

    // 방 이름 변경 이벤트 핸들러
    const handleRoomNameChange = (e) => {
        setObjectDetails((prevDetails) => ({
            ...prevDetails,
            roomName: e.target.value
        }));
    };

    // 렌더링
    return (
        <Draggable
            defaultPosition={{ x: 70, y: 20 }} // Set the default position
            bounds="parent" // Restrict dragging to the parent element
        >
        <div className="input_con" style={{
            position: 'absolute',
            top: '20%',
            left: '70%',
            background: "#4ce7ae",
            padding: '20px',
            zIndex: 100
        }}>
            {/* 선택된 오브젝트의 이름을 보여주는 레이블과 방 이름 입력 필드 */}
            <div>
                <label style={{display: 'flex', justifyContent: 'center'}}>{objectDetails.roomName}</label>
                <input
                    className="roomName"
                    type="text"
                    value={objectDetails.roomName}
                    onChange={handleRoomNameChange}
                    disabled
                />
            </div>
            <br/>
            <div style={{marginLeft: '10px'}}>
                {/* 오브젝트의 정보를 입력받는 동적 필드들 */}
                {objectDetails.info && objectDetails.info.map((item, index) => (
                    <div key={index}>
                        <input
                            className="text_key"
                            type="text"
                            placeholder="항목"
                            value={item.key}
                            onChange={(e) => handleInfoInputChange(e, index, 'key')}
                            disabled
                        />
                        <input
                            className="text_value"
                            type="text"
                            placeholder="값"
                            value={item.value}
                            onChange={(e) => handleInfoInputChange(e, index, 'value')}
                            disabled
                        />
                    </div>
                ))}
            </div>
            <br/>
            <div>
                {/* 저장 및 취소 버튼 */}
                <div className="button-container">
                    <button className="btn btn-primary btn-layer-3_1" onClick={onCancel}>
                        닫기
                        <FontAwesomeIcon icon={faTimes}/>
                    </button>
                </div>
            </div>
        </div>
        </Draggable>
    );
};

// ThreeJs 컴포넌트
const GuestThreeJs = ({ buildingId, gltfBlobUrl: initialGltfBlobUrl, jsonData: initialJsonData }) => {
    const [labels, setLabels] = useState({});
    //이걸로 건물 정보 입력 모달 상태 관리(true 열림, false 닫힘)
    const [showDetailsForm, setShowDetailsForm] = useState(false);
    //메타 데이터 관리
    const [objectDetails, setObjectDetails] = useState({ name: ''});
    //선택된 오브젝트 관리
    const [selectedObject, setSelectedObject] = useState(null);
    const [modifiedObjects, setModifiedObjects] = useState({});
    const [gltf, setGltf] = useState(null);
    const [data, setData] = useState({});
    const [gltfBlobUrl, setGltfBlobUrl] = useState();
    const [gltfBlobUrl2, setGltfBlobUrl2] = useState(initialGltfBlobUrl);
    const [jsonData, setJsonData] = useState(initialJsonData);

    // 초기에 JSON 데이터 설정
    useEffect(() => {
        setGltfBlobUrl2(initialGltfBlobUrl);
    }, [initialGltfBlobUrl]);

    // 초기에 JSON 데이터 설정
    useEffect(() => {
        setData(initialJsonData);
    }, [initialJsonData]);


    const floormodel=(num)=>{
        const url = `/guest/${buildingId}/${num}`;
        axios.get(url) // Blob 형태로 받아옵니다.
            // { responseType: 'blob' }
            .then(response => {
                const floorFileData = response.data.floorFileData;
                const metaData = response.data.metaData;

                const decodedString = atob(metaData);
                const utf8Decoder = new TextDecoder('utf-8');
                const jsonString = utf8Decoder.decode(new Uint8Array(decodedString.split('').map(char => char.charCodeAt(0))));
                const newJsonData = JSON.parse(jsonString);
                setJsonData(newJsonData);

                console.log('jsonData:', jsonData); // 여기에 jsonData를 콘솔에 출력합니다.

                // floorFileData를 base64 디코딩하여 Blob 생성
                const byteCharacters = atob(floorFileData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/octet-stream' });

                const blobUrl = URL.createObjectURL(blob); // Blob URL을 생성합니다.
                setGltfBlobUrl2(null);
                setGltfBlobUrl(blobUrl); // Blob URL을 상태로 저장합니다.
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }

    // 오브젝트 클릭 핸들러
    const handleObjectClick = (object) => {
        setSelectedObject(object);
        setShowDetailsForm(true);

        const objectLabels = labels[object.name];

        setObjectDetails({
            name: objectLabels?.text || object.name || '',
        });

        // Check if object.name exists in jsonData before accessing it
        if (jsonData && jsonData[object.name]) {
            const clickedObjectData = jsonData[object.name];

            if (clickedObjectData) {
                setObjectDetails((prevDetails) => ({
                    ...prevDetails,
                    roomName: clickedObjectData.roomName || '',
                    info: Object.entries(clickedObjectData.info || {}).map(([key, value]) => ({ key, value }))
                }));
            }
        }

        // str2가 숫자인 경우에 추가적인 작업 실행
        const str = object.name;
        const str2 = str.split('_');

        

        if (!isNaN(parseInt(str2[0]))) {
            floormodel(str2[0]);
        }
    }

    //오브젝트 정보와 라벨 정보를 넘겨서 띄워준다
    const setText = (objectss) => {
        objectss.map((object)=>{
                // 클릭된 오브젝트의 경계 상자를 계산합니다.
                const box = new THREE.Box3().setFromObject(object);
                const center = new THREE.Vector3();
                box.getCenter(center); // 경계 상자의 중심 좌표를 구합니다.

                // 경계 상자의 크기를 기반으로 적절한 텍스트 크기를 계산합니다.
                const size = box.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                const fontSize = maxSize * 0.1; // 예를 들어, 최대 크기의 10%로 설정합니다.

                // 경계 상자의 최상단에 텍스트를 띄우기 위해 y 좌표를 조정합니다.
                // size.y의 절반을 중심 좌표에 더해 최상단 좌표를 구합니다.
                center.y += size.y / 1.5;
                //const name =txt[object.name].name;

                // 텍스트 레이블 위치와 크기를 오브젝트 중심에 설정합니다.
                setLabels(prevLabels => {
                    return {
                        ...prevLabels,
                        [object.uuid]: {
                            text: jsonData[object.name].roomName,
                            //text: name,
                            position: center.toArray(),
                            fontSize,
                            rotation: [Math.PI / 2  + Math.PI, Math.PI + Math.PI, 0]
                        }
                    };
                });
            }
        );
    };

    // 라벨 업데이트
    const updateLabel = (roomName, object) => {
        const box = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const fontSize = maxSize * 0.1;

        center.y += size.y / 1.5;

        setLabels({
            ...labels,
            [object.uuid]: {
                text: roomName,
                position: center.toArray(),
                fontSize,
                rotation: [Math.PI / 2  + Math.PI, Math.PI + Math.PI, 0]
            }
        });
    };

    const objects = [];

    //모델에서 받아온 scene으로 json 파일의 데이터를 넣는다
    const setnewgltf = (newgltf) => {
        setLabels({});
        setGltf(newgltf);
        // gltf.traverse((child) => {
        //     if (child instanceof THREE.Mesh && child.name.includes('polygon')) {
        //         // 새로운 재질을 생성하고 적용합니다.
        //         const newMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 빨간색으로 변경하려면 0xff0000을 원하는 색상으로 변경하세요.
        //         child.material = newMaterial;
        //     }
        // });
        console.log(jsonData);
    };

    useEffect(()=>{
        setLabels({});
        if(gltf)
        {
            gltf.traverse((child) => {
                if (child instanceof THREE.Mesh && child.name.includes('polygon')) {
                    objects.push(child)
                    if(child.name == findObj)
                    {
                        const newMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // 빨간색으로 변경하려면 0xff0000을 원하는 색상으로 변경하세요.
                        child.material = newMaterial;
                    }
                }
            });
        }
        setText(objects)
    },[selectedObject])

    // 세부 정보 저장 핸들러
    const handleSubmitDetails = () => {
        if (selectedObject) {
            updateLabel(objectDetails.roomName, selectedObject);
            setModifiedObjects((prevObjects) => ({
                ...prevObjects,
                [selectedObject.uuid]: selectedObject
            }));

            // JSON 데이터 업데이트
            setData((prevData) => {
                const updatedData = { ...prevData };

                // 선택된 오브젝트의 이름이 JSON 데이터에 있는지 확인
                if (updatedData[selectedObject.name]) {
                    const updatedObjectData = updatedData[selectedObject.name];

                    // 수정된 세부 정보에 따라 속성 업데이트
                    updatedObjectData.roomName = objectDetails.roomName || '';

                    // 수정된 세부 정보에 따라 info 속성 업데이트
                    updatedObjectData.info = {};
                    objectDetails.info.forEach((item) => {
                        updatedObjectData.info[item.key] = item.value;
                    });
                }

                return updatedData;
            });

            setShowDetailsForm(false);
        }
    };

    // 입력 필드 변경 이벤트 핸들러
    const handleCancelDetails = () => {
        setShowDetailsForm(false);
    };

    const [searchtest  ,setSearchtest]= useState('');
    const [findObj, setFindObj] = useState();

    const handleChange = (event) => {
        setSearchtest(event.target.value);
      };

    // 방 검색 핸들러
    const searchRoom=()=>{
        // e.preventDefault();
        // const searchRoom = e.target.search.value;
        console.log(searchtest)
        const url = `/guest/${buildingId}/search?roomName=${searchtest}`
        axios.get(url,{ responseType: 'json' })
        .then(response =>{
            console.log(response.status);
            const floorNum = response.data.floor;
            const objName = response.data.objectName;
            setFindObj(objName);
            console.log(floorNum, objName);

            if(response.status==200)
            {
                floormodel(floorNum);
            }
            
        })
        .catch(error => {
            // 오류가 발생한 경우
            console.error('Error during login request:', error);
            Swal.alert("검색 결과가 없습니다.", "다시 검색 해주세요.", "warning");  // alert를 띄움
            // Promise로 오류 반환
            throw error;
        });
    }

    const fetchBuilding = (buildingId) => {
        const url = `/guest/${buildingId}`;
        axios.get(url, { responseType: 'blob' })
            .then(response => {
                const blob = response.data;
                const blobUrl = URL.createObjectURL(blob);
                setGltfBlobUrl(null);
                setGltfBlobUrl2(blobUrl);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };
    const findCencel=()=>{
        setFindObj(null);
        fetchBuilding(buildingId);
    }

    const handleGoBack = () => {
        fetchBuilding(buildingId);
    };

    // 렌더링
    return (
        <div style={{marginLeft: "20px"}}>
            <button className='btn_back' onClick={handleGoBack}><MdOutlineKeyboardBackspace style={{fontSize : '25px', marginRight : '3px'}} />돌아가기</button>
            <input
                type="text"
                value={searchtest}
                onChange={handleChange}
                required
            ></input>
            <button className="btn btn-primary btn-layer-3_1" onClick={searchRoom} >검색</button>
            <button className="btn btn-primary btn-layer-3_1" onClick={findCencel} >취소</button>
            <div>
                {/* 3D 캔버스 */}
                <Canvas
                    style={{height: "1000px", width: "100%", marginTop: "100px"}}
                >
                    <OrbitControls/>
                    <ambientLight intensity={1.0}/>
                    <pointLight position={[10, 10, 10]} intensity={1000}/>
                    {/* 도면 모델 렌더링 */}
                    {gltfBlobUrl && <Model url={gltfBlobUrl} onObjectClick={handleObjectClick}
                                           setModifiedObjects={setModifiedObjects} setnewgltf={setnewgltf}
                                           setText={setText} findObj={findObj} />}
                    {/* 건물 모델 렌더링 */}
                    {gltfBlobUrl2 && <Model2 url={gltfBlobUrl2} onObjectClick={handleObjectClick}
                                           setModifiedObjects={setModifiedObjects} setnewgltf={setnewgltf}
                                           setText={setText}/>}
                    {/* 라벨 렌더링 */}
                    {Object.entries(labels).map(([uuid, label]) => (
                        <Text key={uuid}
                              position={label.position}
                              fontSize={label.fontSize}
                              color="black"
                              anchorX="center"
                              anchorY="middle"
                              rotation={label.rotation}
                            //한글 폰트 추가
                              font={'https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Bold.woff'}
                        >
                            {label.text}
                        </Text>
                    ))}
                </Canvas>
            </div>
            {/* 세부 정보 폼 렌더링 */}
            {showDetailsForm && (
                <ObjectDetailsForm
                    objectDetails={objectDetails}
                    setObjectDetails={setObjectDetails}
                    onSubmit={handleSubmitDetails}
                    onCancel={handleCancelDetails}
                    jsonData={data}
                    selectedObject={selectedObject}
                />
            )}
        </div>
    );
};

export default GuestThreeJs;