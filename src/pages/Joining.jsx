import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Joining = () => {
  const [showJoiningModal, setShowJoiningModal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [joiningFormData, setJoiningFormData] = useState({
    joiningId: '',
    nameAsPerAadhar: '',
    fatherName: '',
    dateOfJoining: '',
    joiningPlace: '',
    designation: '',
    salary: '',
    aadharFrontPhoto: null,
    aadharBackPhoto: null,
    panCard: null,
    candidatePhoto: null,
    currentAddress: '',
    addressAsPerAadhar: '',
    dobAsPerAadhar: '',
    gender: '',
    mobileNo: '',
    familyMobileNo: '',
    relationshipWithFamily: '',
    pastPfId: '',
    currentBankAc: '',
    ifscCode: '',
    branchName: '',
    bankPassbookPhoto: null,
    personalEmail: '',
    esicNo: '',
    highestQualification: '',
    pfEligible: '',
    esicEligible: '',
    joiningCompanyName: '',
    emailToBeIssue: '',
    issueMobile: '',
    issueLaptop: '',
    aadharCardNo: '',
    modeOfAttendance: '',
    qualificationPhoto: null,
    paymentMode: '',
    salarySlip: null,
    resumeCopy: null,
    department: '',
    equipment: ''
  });

  const handleJoiningInputChange = (e) => {
    const { name, value } = e.target;
    setJoiningFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setJoiningFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const postToJoiningSheet = async (rowData) => {
    const URL = 'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec';

    try {
      console.log('Attempting to post:', {
        sheetName: 'JOINING',
        rowData: rowData
      });

      const params = new URLSearchParams();
      params.append('sheetName', 'JOINING');
      params.append('action', 'insert');
      params.append('rowData', JSON.stringify(rowData));

      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Server returned unsuccessful response');
      }

      return data;
    } catch (error) {
      console.error('Full error details:', {
        error: error.message,
        stack: error.stack,
        rowData: rowData,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Failed to update sheet: ${error.message}`);
    }
  };

  const uploadFileToDrive = async (file, folderId = '1Jk4XQKvq4QQRC7COAcajUReoX7zbQtW0') => {
    try {
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const params = new URLSearchParams();
      params.append('action', 'uploadFile');
      params.append('base64Data', base64Data);
      params.append('fileName', file.name);
      params.append('mimeType', file.type);
      params.append('folderId', folderId);

      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbwfGaiHaPhexcE9i-A7q9m81IX6zWqpr4lZBe4AkhlTjVl4wCl0v_ltvBibfduNArBVoA/exec',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'File upload failed');
      }

      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  };

  const handleJoiningSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Upload only the required files
      const uploadPromises = {};
      const fileFields = [
        'aadharFrontPhoto',
        'bankPassbookPhoto'
      ];

      for (const field of fileFields) {
        if (joiningFormData[field]) {
          uploadPromises[field] = uploadFileToDrive(joiningFormData[field]);
        } else {
          uploadPromises[field] = Promise.resolve('');
        }
      }

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(
        Object.values(uploadPromises).map(promise => 
          promise.catch(error => {
            console.error('Upload failed:', error);
            return ''; // Return empty string if upload fails
          })
        )
      );

      // Map uploaded URLs to their respective fields
      const fileUrls = {};
      Object.keys(uploadPromises).forEach((field, index) => {
        fileUrls[field] = uploadedUrls[index];
      });

      // Format the timestamp in the required format: 9/8/2025 10:55:38
      const now = new Date();
      const formattedTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      // Create an array with all column values in order
      const rowData = [];
      
      // Assign values directly to array indices according to specified columns
      rowData[0] = formattedTimestamp;           // Column A: Timestamp
      rowData[1] = joiningFormData.joiningId;    // Column B: Joining ID
      rowData[2] = joiningFormData.nameAsPerAadhar;   // Column C: Name As Per Aadhar
      rowData[3] = joiningFormData.fatherName;   // Column D: Father Name
      rowData[4] = joiningFormData.dateOfJoining; // Column E: Date Of Joining
      rowData[5] = joiningFormData.designation; // Column F: Designation
      rowData[6] = fileUrls.aadharFrontPhoto;    // Column G: Aadhar card
      rowData[7] = '';  // Column H: Candidate Photo
      rowData[8] = joiningFormData.currentAddress;  // Column I: Current Address
      rowData[9] = joiningFormData.dobAsPerAadhar; // Column J: Date Of Birth
      rowData[10] = joiningFormData.gender;      // Column K: Gender
      rowData[11] = joiningFormData.mobileNo; // Column L: Mobile No.
      rowData[12] = joiningFormData.familyMobileNo; // Column M: Family Mobile Number
      rowData[13] = joiningFormData.relationshipWithFamily; // Column N: Relationship With Family
      rowData[14] = joiningFormData.currentBankAc; // Column O: Current Account No
      rowData[15] = joiningFormData.ifscCode;    // Column P: IFSC Code
      rowData[16] = joiningFormData.branchName;  // Column Q: Branch Name
      rowData[17] = fileUrls.bankPassbookPhoto;  // Column R: Photo Of Front Bank Passbook
      rowData[18] = joiningFormData.personalEmail; // Column S: Candidate Email
      rowData[19] = joiningFormData.highestQualification; // Column T: Highest Qualification
      rowData[20] = joiningFormData.department;  // Column U: Department
      rowData[21] = joiningFormData.equipment;   // Column V: Equipment
      rowData[22] = joiningFormData.aadharCardNo;       // Column W: Aadhar Number
      rowData[23] = ''; // Column X: Candidate Resume
      rowData[24] = "";
      rowData[25] = "";
      rowData[26] = formattedTimestamp; // Column AA: Actual Date

      await postToJoiningSheet(rowData);

      console.log("Joining Form Data:", rowData);

      toast.success('Employee added successfully!');
      setShowJoiningModal(false);
      
      // Reset form
      setJoiningFormData({
        joiningId: '',
        nameAsPerAadhar: '',
        fatherName: '',
        dateOfJoining: '',
        joiningPlace: '',
        designation: '',
        salary: '',
        aadharFrontPhoto: null,
        aadharBackPhoto: null,
        panCard: null,
        candidatePhoto: null,
        currentAddress: '',
        addressAsPerAadhar: '',
        dobAsPerAadhar: '',
        gender: '',
        mobileNo: '',
        familyMobileNo: '',
        relationshipWithFamily: '',
        pastPfId: '',
        currentBankAc: '',
        ifscCode: '',
        branchName: '',
        bankPassbookPhoto: null,
        personalEmail: '',
        esicNo: '',
        highestQualification: '',
        pfEligible: '',
        esicEligible: '',
        joiningCompanyName: '',
        emailToBeIssue: '',
        issueMobile: '',
        issueLaptop: '',
        aadharCardNo: '',
        modeOfAttendance: '',
        qualificationPhoto: null,
        paymentMode: '',
        salarySlip: null,
        resumeCopy: null,
        department: '',
        equipment: ''
      });
    } catch (error) {
      console.error('Error submitting joining form:', error);
      toast.error(`Failed to submit joining form: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-300 bg-indigo-700 text-white">
            <h1 className="text-xl md:text-2xl font-bold">Employee Joining Form</h1>
            <button
              onClick={() => setShowJoiningModal(false)}
              className="text-white hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleJoiningSubmit} className="p-4 md:p-6 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining ID *
                </label>
                <input
                  type="text"
                  name="joiningId"
                  value={joiningFormData.joiningId}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name As Per Aadhar *
                </label>
                <input
                  type="text"
                  name="nameAsPerAadhar"
                  value={joiningFormData.nameAsPerAadhar}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={joiningFormData.fatherName}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Of Birth As per Aadhar *
                </label>
                <input
                  type="date"
                  name="dobAsPerAadhar"
                  value={joiningFormData.dobAsPerAadhar}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={joiningFormData.gender}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={joiningFormData.department}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <input
                  type="text"
                  name="equipment"
                  value={joiningFormData.equipment}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile No. *
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={joiningFormData.mobileNo}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Email *
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={joiningFormData.personalEmail}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family Mobile Number *
                </label>
                <input
                  name="familyMobileNo"
                  value={joiningFormData.familyMobileNo}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship With Family *
                </label>
                <input
                  name="relationshipWithFamily"
                  value={joiningFormData.relationshipWithFamily}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Section 3: Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Address *
                </label>
                <textarea
                  name="currentAddress"
                  value={joiningFormData.currentAddress}
                  onChange={handleJoiningInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address As Per Aadhar
                </label>
                <textarea
                  name="addressAsPerAadhar"
                  value={joiningFormData.addressAsPerAadhar}
                  onChange={handleJoiningInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
            </div>

            {/* Section 4: Employment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Of Joining *
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={joiningFormData.dateOfJoining}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  name="designation"
                  value={joiningFormData.designation}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Qualification
                </label>
                <input
                  name="highestQualification"
                  value={joiningFormData.highestQualification}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                <input
                  type="number"
                  name="salary"
                  value={joiningFormData.salary}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                />
              </div>
            </div>

            {/* Section 5: Bank & Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Card Number *
                </label>
                <input
                  name="aadharCardNo"
                  value={joiningFormData.aadharCardNo}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Bank Account No*
                </label>
                <input
                  name="currentBankAc"
                  value={joiningFormData.currentBankAc}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code*
                </label>
                <input
                  name="ifscCode"
                  value={joiningFormData.ifscCode}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name*
                </label>
                <input
                  name="branchName"
                  value={joiningFormData.branchName}
                  onChange={handleJoiningInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Section 6: Document Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Card (Front)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "aadharFrontPhoto")}
                    className="hidden"
                    id="aadhar-front-upload"
                  />
                  <label
                    htmlFor="aadhar-front-upload"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                  </label>
                  {joiningFormData.aadharFrontPhoto && (
                    <span className="text-sm text-gray-700">
                      {joiningFormData.aadharFrontPhoto.name}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo Of Front Bank Passbook
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "bankPassbookPhoto")}
                    className="hidden"
                    id="bank-passbook-upload"
                  />
                  <label
                    htmlFor="bank-passbook-upload"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-700"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                  </label>
                  {joiningFormData.bankPassbookPhoto && (
                    <span className="text-sm text-gray-700">
                      {joiningFormData.bankPassbookPhoto.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowJoiningModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white bg-indigo-700 rounded-md hover:bg-indigo-800 flex items-center justify-center min-h-[42px] ${
                  submitting ? "opacity-90 cursor-not-allowed" : ""
                }`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Joining;