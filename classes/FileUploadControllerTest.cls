@isTest
private class FileUploadControllerTest{

	@isTest
	static void test_saveTheChunk_1batch(){
		//Arrange
		Account acct = new Account();
		acct.Name = 'File Upload Test';
		insert acct;

		String fileName = 'file upload test';
		String base64Data = 'Some Content';
		String contentType = 'txt'; 
		String fileId;


		//Act
		test.startTest();
		Id result = FileUploadController.saveTheChunk(acct.Id, fileName, base64Data, contentType, fileId);
		test.stopTest();


		//Assert
		System.assertNotEquals(null, result, 'Attachment should have been inserted.');

	}

	@isTest
	static void test_saveTheChunk_twoBatches(){
		//Arrange
		Account acct = new Account();
		acct.Name = 'File Upload Test';
		insert acct;

		String fileName = 'file upload test';
		String base64Data1 = 'Some Content part 1';
		String contentType = 'txt';
		Id fileId;
		fileId = FileUploadController.saveTheChunk(acct.Id, fileName, base64Data1, contentType, null);

		String base64Data2 = 'Some Content part 2';

		//Act
		test.startTest();
		Id result = FileUploadController.saveTheChunk(acct.Id, fileName, base64Data2, contentType, fileId);
		Attachment[] attachments = [SELECT Id, Body FROM Attachment WHERE ParentId = :acct.Id];
		test.stopTest();


		//Assert
		System.assertNotEquals(null, result, 'Attachment should have been inserted.');		
		System.assertEquals(fileId, result, 'Attachment Id should match first Id.');
		System.assertEquals(1, attachments.size());

	}


}