package com.myapp.ecommerce.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import com.myapp.ecommerce.entity.State;

import java.util.List;

//@CrossOrigin("http://localhost:4200") set under MyDataRestConfig
@RepositoryRestResource(collectionResourceRel = "states", path = "states")
public interface StateRepository extends JpaRepository<State,Integer> {

    List<State> findByCountryCode(@Param("code") String code);
}
