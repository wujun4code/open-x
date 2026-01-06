// Test script to verify GraphQL backend
const testQuery = async () => {
  try {
    // Test 1: Get list of users
    const usersResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            users(limit: 5) {
              id
              username
              name
            }
          }
        `
      })
    });

    const usersData = await usersResponse.json();
    console.log('=== Users in database ===');
    if (usersData.data && usersData.data.users) {
      usersData.data.users.forEach(user => {
        console.log(`  - @${user.username} (${user.name || 'No name'})`);
      });

      // Test with the first user
      if (usersData.data.users.length > 0) {
        const firstUser = usersData.data.users[0];
        console.log(`\n=== Testing userByUsername with @${firstUser.username} ===`);

        const userByUsernameResponse = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                userByUsername(username: "${firstUser.username}") {
                  id
                  username
                  name
                  bio
                  isFollowing
                  followersCount
                  followingCount
                  postsCount
                }
              }
            `
          })
        });

        const userByUsernameData = await userByUsernameResponse.json();
        console.log('Result:', JSON.stringify(userByUsernameData, null, 2));
      }
    }

    // Test 2: Try to get a non-existent user
    console.log('\n=== Testing with non-existent user @robertsmith2026 ===');
    const nonExistentResponse = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            userByUsername(username: "robertsmith2026") {
              id
              username
              name
            }
          }
        `
      })
    });

    const nonExistentData = await nonExistentResponse.json();
    console.log('Result:', JSON.stringify(nonExistentData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
};

testQuery();
