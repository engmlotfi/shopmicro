echo "Tagging Images"
docker tag shopmicro_cart eu.gcr.io/tidy-way-264120/cart
docker tag shopmicro_users eu.gcr.io/tidy-way-264120/users
docker tag shopmicro_orders eu.gcr.io/tidy-way-264120/orders
docker tag shopmicro_catalogue eu.gcr.io/tidy-way-264120/catalogue
docker tag shopmicro_front-end eu.gcr.io/tidy-way-264120/front-end
docker tag shopmicro_database eu.gcr.io/tidy-way-264120/database
echo "Push cart"
docker push eu.gcr.io/tidy-way-264120/cart
echo "Push users"
docker push eu.gcr.io/tidy-way-264120/users
echo "Push orders"
docker push eu.gcr.io/tidy-way-264120/orders
echo "Push catalogue"
docker push eu.gcr.io/tidy-way-264120/catalogue
echo "Push front-end"
docker push eu.gcr.io/tidy-way-264120/front-end
echo "Push database"
docker push eu.gcr.io/tidy-way-264120/database

