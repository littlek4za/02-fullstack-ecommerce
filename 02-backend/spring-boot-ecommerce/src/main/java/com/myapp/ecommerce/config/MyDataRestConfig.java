package com.myapp.ecommerce.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import com.myapp.ecommerce.entity.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {

    private EntityManager entityManager;

    @Value("${allowed.origins}")
    private String[] theAllowedOrigins;

    @Autowired
    public MyDataRestConfig(EntityManager entityManager){
        this.entityManager = entityManager;
    }

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {

        HttpMethod[] theUnsupportedActions = {HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.POST, HttpMethod.PATCH};

        // disable HTTP methods for entity: PUT, POST, DELETE
        disableHttpMethods(Product.class, config, theUnsupportedActions);
        disableHttpMethods(ProductCategory.class, config, theUnsupportedActions);
        disableHttpMethods(Country.class, config, theUnsupportedActions);
        disableHttpMethods(State.class, config, theUnsupportedActions);
        disableHttpMethods(Order.class, config, theUnsupportedActions);

        // call an internal helper method to expose category id
        exposedIds(config);

        // configure the cors mapping
        cors.addMapping(config.getBasePath() + "/**").allowedOrigins(theAllowedOrigins);

    }

    private static void disableHttpMethods(Class theClass, RepositoryRestConfiguration config, HttpMethod[] theUnsupportedActions) {
        config.getExposureConfiguration()
                .forDomainType(theClass)
                .withItemExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions))
                .withCollectionExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions));
    }

    private void exposedIds(RepositoryRestConfiguration config){

        //expose entity Ids

        // get a list of all entity classes from the entity manager
        // EntityType<?> is a class representing metadata for a JPA entity (like Product, ProductCategory, etc.).
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();

        // create an arraylist of the entity types (to collect actual java class)
        List<Class> entityClasses = new ArrayList<>();

        // get the entity types for the entities
        // this returns the actual java class instead of EntityType<?>
        for (EntityType tempEntityType: entities){
            entityClasses.add((tempEntityType.getJavaType()));
        }

        // convert the arraylist of class to array
        // from entityClasses = [Product.class, ProductCategory.class];
        // to domainTypes = [Product.class, ProductCategory.class];
        Class[] domainTypes = entityClasses.toArray(new Class[0]);

        // expose the entity ids for the array of the entity domain types
        config.exposeIdsFor(domainTypes);
    }
}
