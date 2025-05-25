// Async function to get list of accounts from mock API
export const fetchAccounts = async () => {
    try {
        // Call API by method "GET" to endpoint mock with API key
        const response = await fetch("https://mindx-mockup-server.vercel.app/api/resources/accounts_user?apiKey=67fe686cc590d6933cc1248b");

        // If response is not successful (status is not 200-299), throw error
        if (!response.ok) throw new Error("<< Error When Getting Data >>");

        // Parse reponse JSON into Javascript object
        const result = await response.json()

        // Print raw result from API to console for debugging
        console.log("<< Account API Raw Result: >> : ", result);

        // Return array of user data from result.data.data
        // Because mock API's data structure is: { data: { data: [...] } }
        console.log(result.data.data)
        return result.data.data;
    } catch (error) {
        // Catch error if call API or fail to parse JSON
        console.error("<< Error When Calling API >> : ", error)

        // Return empty array to prevent app crash
        return [];
    }
};