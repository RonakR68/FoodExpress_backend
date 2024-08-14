from flask import Flask, request, jsonify
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

@app.route('/recommend', methods=['POST'])
def recommend():
    content = request.json
    user_id = content['userId']
    print('userId: ', user_id)
    n_recommendations = 3  # Number of recommendations to return, default to 3
    diff_threshold = 2  # Threshold for large rating differences
    similarity_threshold = 0.3  # Threshold for similarity to consider
    data = content['data']

    df = pd.DataFrame(data)
    
    # Aggregate Multiple Ratings
    df_aggregated = df.groupby(['userId', 'restaurantId']).agg({'restaurantRating': 'mean'}).reset_index()
    
    # Pivot to create a matrix of users and their aggregated ratings
    item_matrix = df_aggregated.pivot_table(index='userId', columns='restaurantId', values='restaurantRating').fillna(0)
    print("Item Matrix after aggregation:\n", item_matrix)

    def filter_similar_users(matrix, user_id, diff_threshold):
        user_ratings = matrix.loc[user_id]
        users_to_exclude = []

        for other_user in matrix.index:
            if other_user == user_id:
                continue
            common_items = user_ratings[user_ratings > 0].index.intersection(matrix.loc[other_user][matrix.loc[other_user] > 0].index)
            if not common_items.empty:
                rating_diffs = abs(user_ratings[common_items] - matrix.loc[other_user, common_items])
                if any(rating_diffs > diff_threshold):
                    users_to_exclude.append(other_user)

        filtered_matrix = matrix.drop(users_to_exclude, axis=0, errors='ignore')
        return filtered_matrix

    filtered_item_matrix = filter_similar_users(item_matrix, user_id, diff_threshold)
    print("Filtered Item Matrix:\n", filtered_item_matrix)

    def compute_cosine_similarity(user_ratings, other_user_ratings):
        # Find common items where both users have non-zero ratings
        common_items = user_ratings[(user_ratings > 0) & (other_user_ratings > 0)].index
        
        if len(common_items) < 1:  # Require at least 1 common item to compute similarity
            return 0
        
        user_ratings_common = user_ratings[common_items]
        other_user_ratings_common = other_user_ratings[common_items]

        # Print the matrix used for cosine similarity computation
        print(f"Common Items:\n{common_items}")
        print(f"User Ratings (common items):\n{user_ratings_common}")
        print(f"Other User Ratings (common items):\n{other_user_ratings_common}")

        if np.all(user_ratings_common == 0) or np.all(other_user_ratings_common == 0):
            return 0
        
        return cosine_similarity([user_ratings_common], [other_user_ratings_common])[0, 0]


    # Compute similarity scores
    similarity_matrix = np.zeros((len(filtered_item_matrix), len(filtered_item_matrix)))
    user_indices = filtered_item_matrix.index

    for i, user1 in enumerate(user_indices):
        for j, user2 in enumerate(user_indices):
            if user1 != user2:
                similarity_matrix[i, j] = compute_cosine_similarity(filtered_item_matrix.loc[user1], filtered_item_matrix.loc[user2])
    
    similarity_df = pd.DataFrame(similarity_matrix, index=user_indices, columns=user_indices)
    print("User-User Similarities Matrix:\n", similarity_df)

    similarity_df = similarity_df.drop(user_id, axis=0, errors='ignore')
    print("Similarity DataFrame (excluding the input user):\n", similarity_df)

    similarity_df = similarity_df[similarity_df[user_id] > similarity_threshold]
    print(f"Similar Users Above Threshold ({similarity_threshold}):\n", similarity_df)

    top_similar_users = similarity_df.nlargest(n_recommendations, user_id) if not similarity_df.empty else pd.DataFrame()
    print("Top Similar Users:\n", top_similar_users)

    unrated_restaurants = item_matrix.columns[item_matrix.loc[user_id] == 0]
    print("Unrated Restaurants:\n", unrated_restaurants)

    predicted_ratings = {}
    for restaurant in unrated_restaurants:
        weighted_sum = 0
        similarity_sum = 0
        for similar_user in top_similar_users.index:
            if item_matrix.at[similar_user, restaurant] > 0:
                similarity = similarity_df.at[similar_user, user_id]
                weighted_sum += similarity * item_matrix.at[similar_user, restaurant]
                similarity_sum += similarity
        if similarity_sum > 0:
            predicted_ratings[restaurant] = weighted_sum / similarity_sum

    print("Predicted Ratings for Unrated Restaurants:\n", predicted_ratings)

    # Filter out restaurants with a predicted rating less than 3
    filtered_predictions = {restaurant: rating for restaurant, rating in predicted_ratings.items() if rating >= 3}
    print("Filtered Predicted Ratings (only ratings >= 3):\n", filtered_predictions)

    top_recommendations = sorted(filtered_predictions, key=filtered_predictions.get, reverse=True)
    print("Top Recommendations (before limiting):\n", top_recommendations)

    recommended_restaurants = top_recommendations[:n_recommendations]
    print("Top", n_recommendations, "Recommended Restaurants:\n", recommended_restaurants)

    return jsonify(recommended_restaurants)

if __name__ == '__main__':
    app.run(port=5001)
