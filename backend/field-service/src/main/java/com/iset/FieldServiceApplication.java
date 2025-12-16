package com.iset;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class FieldServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FieldServiceApplication.class, args);
	}

}
