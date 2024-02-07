import { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import Button from "react-bootstrap/Button";
import { useNavigate } from 'react-router-dom';
import * as Swal from "../apis/alert";
import Modal from 'react-bootstrap/Modal';

const CreateCode = ({buildingId, setOffcanvas, jsonData}) => {
    let [pageLink, setPageLink] = useState(null);
    const navigate = useNavigate();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const qrCanvasRef = useRef(null);

    const openModal = () => {
        setModalIsOpen(true);
    }

    const closeModal = () => {
        setModalIsOpen(false);
    }

    // QR 코드 생성
    const generateQRCode = () => {
        if (!buildingId) {
            console.log('Invalid buildingId');
            return;
        }
        setPageLink(`http://10.101.180.209:3000/guest?buildingId=${buildingId}`);
        openModal();
    };

    // QR 코드를 이미지로 다운로드
    const downloadQRCode = () => {
        const canvas = qrCanvasRef.current.children[0];
        const link = document.createElement('a');
        link.download = 'qr_code.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    // QR 코드 클릭 시, 해당 페이지로 이동 ( 임시 )
    const qrButtonClick = () => {
        Swal.confirms("사용자 페이지로 이동하시겠습니까?", "", "question",
            (result) => {
                if( result.isConfirmed ) {
                    navigate(`/guest?buildingId=${buildingId}`)
                }
            })
    }

    return (
        <div>
            {/* QR 코드 생성 버튼 */}
            <button className='itemBtnStyle' onClick={generateQRCode}>QR생성</button>
            <Modal show={modalIsOpen} onHide={closeModal}
                   style={{
                       width: '30%', // 원하는 너비를 설정합니다.
                       height: '50%', // 원하는 높이를 설정합니다.
                       position: 'fixed',
                       top: '50%',
                       left: '50%',
                       transform: 'translate(-50%, -50%)'
                   }}>
                <Modal.Header closeButton>
                    <Modal.Title>QR 코드</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div ref={qrCanvasRef}>
                        <QRCode value={pageLink} onClick={qrButtonClick}/>
                    </div>
                    <Button style={{background : '#7a573e', color:'white'}} onClick={downloadQRCode}>다운로드</Button>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CreateCode;